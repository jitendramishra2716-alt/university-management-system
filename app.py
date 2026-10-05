import time
import random
import threading
from flask import Flask, jsonify, request, send_from_directory
from ml_models import RoadPulseAI
from route_optimizer import RouteOptimizer
import os

app = Flask(__name__, static_folder='static')

# Initialize models and routing engine
ml_system = RoadPulseAI()
router = RouteOptimizer()

# Global state for simulation
simulation_state = {
    "weather": "Sunny",  # Sunny, Rain, Snow, Fog
    "simulation_speed": 1.0,
    "active_incidents": 0,
    "incident_nodes": set(),
    "congestion_multipliers": {}, # format: "A-B" -> multiplier
}

vehicles = []
registered_ids = set()

# Helper to generate a random license plate
def generate_plate(v_type):
    states = ["TX", "CA", "NY", "FL", "IL"]
    nums1 = random.randint(100, 999)
    chars = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
    nums2 = random.randint(1000, 9999)
    return f"{random.choice(states)}-{nums1}{chars}-{nums2}"

# Helper to initialize vehicle telemetry
def create_vehicle(v_id, model, v_type, driver_profile=None):
    plate = generate_plate(v_type)
    
    # Base parameters by type
    if v_type == "Electric":
        mileage = random.uniform(5000, 45000)
        age = random.uniform(0.5, 3.5)
        fuel_consumption = random.uniform(12.0, 18.0) # kWh/100km
        co2_g_km = 0.0
    elif v_type == "Sedan":
        mileage = random.uniform(15000, 100000)
        age = random.uniform(1.0, 7.0)
        fuel_consumption = random.uniform(6.5, 8.5) # L/100km
        co2_g_km = round(fuel_consumption * 23.2, 1) # ~23.2g CO2 per L fuel * 10
    elif v_type == "SUV":
        mileage = random.uniform(10000, 120000)
        age = random.uniform(1.0, 9.0)
        fuel_consumption = random.uniform(8.0, 11.5) # L/100km
        co2_g_km = round(fuel_consumption * 23.2, 1)
    else: # Truck / Heavy
        mileage = random.uniform(30000, 200000)
        age = random.uniform(2.0, 12.0)
        fuel_consumption = random.uniform(18.0, 28.0) # L/100km
        co2_g_km = round(fuel_consumption * 26.8, 1) # Diesel higher CO2
        
    # Generate sensor data
    vibration = random.uniform(1.0, 3.5)
    engine_temp = random.uniform(82, 95)
    
    # Assign start route
    all_nodes = list(router.nodes.keys())
    start_node = random.choice(all_nodes)
    end_node = random.choice([n for n in all_nodes if n != start_node])
    
    # Dijkstra path
    path_data = router.find_shortest_path(start_node, end_node)
    
    # Predict maintenance status on startup
    maintenance_res = ml_system.predict_maintenance(mileage, vibration, engine_temp, age)
    
    # Driver profile: if not set, classify based on speed and driving behavior
    if not driver_profile:
        # Determine behavior randomly
        profile_seed = random.choice([
            (55, 0.5, fuel_consumption * 0.9, 0.2), # Eco
            (85, 6.5, fuel_consumption * 1.3, 1.8), # Aggressive
            (60, 2.0, fuel_consumption, 0.8), # Commuter
        ])
        classification = ml_system.classify_driver(*profile_seed)
        driver_profile = classification['profile']
        
    vehicle_data = {
        "id": v_id,
        "plate": plate,
        "model": model,
        "type": v_type,
        "mileage": round(mileage, 1),
        "age": round(age, 1),
        "fuel_rate": fuel_consumption, # L/100km or kWh/100km
        "co2": co2_g_km,
        "vibration": round(vibration, 2),
        "engine_temp": round(engine_temp, 1),
        "needs_maintenance": maintenance_res["needs_maintenance"],
        "maintenance_prob": maintenance_res["probability"],
        "driver_profile": driver_profile,
        # Navigation
        "current_route": path_data.get("path", []),
        "route_coords": path_data.get("coords", []),
        "route_index": 0, # which node they are at
        "segment_progress": 0.0, # progress between current node and next (0.0 to 1.0)
        # Position
        "x": router.nodes[start_node]['x'],
        "y": router.nodes[start_node]['y'],
        "current_node": start_node,
        "next_node": path_data.get("path", [start_node])[min(1, len(path_data.get("path", [start_node]))-1)],
        "speed": random.uniform(30, 60), # km/h
        "status": "Moving",
        "last_update": time.time()
    }
    return vehicle_data

# Seed initial vehicles
def seed_vehicles():
    initial_fleet = [
        ("VP-101", "Tesla Model Y", "Electric"),
        ("VP-102", "Toyota Prius", "Sedan"),
        ("VP-103", "Ford F-150", "Truck"),
        ("VP-104", "BMW X5", "SUV"),
        ("VP-105", "Honda Civic", "Sedan"),
        ("VP-106", "Volvo FH16", "Truck"),
        ("VP-107", "Nissan Leaf", "Electric"),
        ("VP-108", "Chevrolet Tahoe", "SUV")
    ]
    for idx, (v_id, model, v_type) in enumerate(initial_fleet):
        vehicles.append(create_vehicle(v_id, model, v_type))
        registered_ids.add(v_id)

seed_vehicles()

# Background thread to update vehicle coordinates and telemetry
def update_simulation():
    while True:
        try:
            # Sleep 1 second in real time (scaled by simulation speed)
            time.sleep(1.0 / max(0.1, simulation_state["simulation_speed"]))
            
            # Weather variables affecting speed and sensors
            weather = simulation_state["weather"]
            speed_mult = 1.0
            temp_offset = 0.0
            vib_offset = 0.0
            
            if weather == "Rain":
                speed_mult = 0.8
                temp_offset = -2.0
                vib_offset = 0.2
            elif weather == "Snow":
                speed_mult = 0.5
                temp_offset = -6.0
                vib_offset = 0.5
            elif weather == "Fog":
                speed_mult = 0.7
                temp_offset = -1.0
                vib_offset = 0.1
                
            for v in vehicles:
                if v["status"] == "Stopped":
                    continue
                    
                # Increment mileage slightly (simulating active driving)
                # 1 second of simulation time at e.g. 50 km/h is 50 * (1/3600) km = ~0.014 km
                delta_km = (v["speed"] / 3600.0) * simulation_state["simulation_speed"]
                v["mileage"] = round(v["mileage"] + delta_km, 3)
                
                # Fluctuate engine temperature and vibration slightly
                v["engine_temp"] = round(max(75.0, min(120.0, v["engine_temp"] + random.uniform(-0.5, 0.5) + (temp_offset * 0.1))), 1)
                v["vibration"] = round(max(0.2, min(9.0, v["vibration"] + random.uniform(-0.1, 0.1) + (vib_offset * 0.05))), 2)
                
                # Rerun ML maintenance predictor periodically (every ~30 ticks or so)
                if random.random() < 0.03:
                    m_pred = ml_system.predict_maintenance(v["mileage"], v["vibration"], v["engine_temp"], v["age"])
                    v["needs_maintenance"] = m_pred["needs_maintenance"]
                    v["maintenance_prob"] = m_pred["probability"]
                
                # Navigation update
                route = v["current_route"]
                coords = v["route_coords"]
                idx = v["route_index"]
                
                if len(route) < 2:
                    # Reroute to a new random destination
                    all_nodes = list(router.nodes.keys())
                    start = v["current_node"]
                    end = random.choice([n for n in all_nodes if n != start])
                    path_data = router.find_shortest_path(start, end, simulation_state["congestion_multipliers"])
                    v["current_route"] = path_data.get("path", [start])
                    v["route_coords"] = path_data.get("coords", [])
                    v["route_index"] = 0
                    v["segment_progress"] = 0.0
                    continue
                
                # Move vehicle along current segment
                # progress speed is relative to speed / distance
                curr_node_name = route[idx]
                next_node_name = route[idx + 1]
                
                # Check congestion multiplier on this edge
                edge_key = f"{curr_node_name}-{next_node_name}"
                congestion_mult = simulation_state["congestion_multipliers"].get(edge_key, 1.0)
                
                # Base distance
                dist = router.base_edges[curr_node_name][next_node_name]
                
                # Speed dynamic adjustment
                target_speed = random.uniform(40, 80) if v["type"] != "Truck" else random.uniform(30, 60)
                # Congestion reduces speed
                v["speed"] = round(max(10.0, (target_speed / congestion_mult) * speed_mult), 1)
                
                # Progress delta per tick (segment base_distance / speed)
                # Let's say speed (km/h) is converted to canvas pixels per tick
                # 1 pixel = 1 meter approx. 
                # speed in m/s = speed / 3.6
                pixels_per_sec = (v["speed"] / 3.6) * 0.3 * simulation_state["simulation_speed"] # scaled for nice visual flow
                progress_delta = pixels_per_sec / dist
                v["segment_progress"] += progress_delta
                
                if v["segment_progress"] >= 1.0:
                    # Move to next node
                    v["route_index"] += 1
                    v["segment_progress"] = 0.0
                    v["current_node"] = next_node_name
                    
                    if v["route_index"] >= len(route) - 1:
                        # Reached destination, compute new route next tick
                        v["current_route"] = []
                    else:
                        v["next_node"] = route[v["route_index"] + 1]
                        v["x"] = router.nodes[v["current_node"]]['x']
                        v["y"] = router.nodes[v["current_node"]]['y']
                else:
                    # Interpolate coordinates
                    c_node = router.nodes[curr_node_name]
                    n_node = router.nodes[next_node_name]
                    v["x"] = round(c_node['x'] + (n_node['x'] - c_node['x']) * v["segment_progress"], 1)
                    v["y"] = round(c_node['y'] + (n_node['y'] - c_node['y']) * v["segment_progress"], 1)
                    v["next_node"] = next_node_name
                    
        except Exception as e:
            print("Simulation update error:", e)

# Spin up simulator thread
sim_thread = threading.Thread(target=update_simulation, daemon=True)
sim_thread.start()

# API Endpoints
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/<path:filename>')
def serve_root_file(filename):
    if os.path.exists(os.path.join(app.static_folder, filename)):
        return send_from_directory(app.static_folder, filename)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/map', methods=['GET'])
def get_map():
    return jsonify(router.get_map_data())

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    return jsonify(vehicles)

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    # Calculate aggregate stats
    total_vehicles = len(vehicles)
    avg_speed = sum(v["speed"] for v in vehicles) / max(1, total_vehicles)
    avg_fuel = sum(v["fuel_rate"] for v in vehicles) / max(1, total_vehicles)
    avg_co2 = sum(v["co2"] for v in vehicles) / max(1, total_vehicles)
    
    # Needs maintenance ratio
    maintenance_needed = sum(1 for v in vehicles if v["needs_maintenance"])
    
    # Calculate congestion level based on edge multipliers
    active_multipliers = list(simulation_state["congestion_multipliers"].values())
    congestion_index = 0.0
    if active_multipliers:
        congestion_index = (sum(active_multipliers) / len(active_multipliers) - 1.0) * 100 # percentage scale
        congestion_index = max(0.0, min(100.0, congestion_index))
    else:
        # Estimate congestion index from speed ratios
        congestion_index = max(5.0, min(95.0, 60.0 - (avg_speed * 0.8)))
        
    return jsonify({
        "total_vehicles": total_vehicles,
        "avg_speed": round(avg_speed, 1),
        "avg_fuel_consumption": round(avg_fuel, 2),
        "avg_co2": round(avg_co2, 1),
        "maintenance_needed": maintenance_needed,
        "congestion_index": round(congestion_index, 1),
        "weather": simulation_state["weather"],
        "active_incidents": simulation_state["active_incidents"],
        "sim_speed": simulation_state["simulation_speed"]
    })

@app.route('/api/vehicles/register', methods=['POST'])
def register_vehicle():
    data = request.json or {}
    model = data.get("model", "Custom Sedan")
    v_type = data.get("type", "Sedan")
    
    # Generate unique ID
    v_num = 101 + len(vehicles)
    v_id = f"VP-{v_num}"
    while v_id in registered_ids:
        v_num += 1
        v_id = f"VP-{v_num}"
        
    vehicle = create_vehicle(v_id, model, v_type)
    vehicles.append(vehicle)
    registered_ids.add(v_id)
    
    return jsonify({"success": True, "vehicle": vehicle})

@app.route('/api/predict/maintenance', methods=['POST'])
def predict_maintenance():
    data = request.json or {}
    mileage = data.get("mileage", 50000)
    vibration = data.get("vibration", 2.0)
    engine_temp = data.get("engine_temp", 90.0)
    age = data.get("age", 4.0)
    
    res = ml_system.predict_maintenance(mileage, vibration, engine_temp, age)
    return jsonify(res)

@app.route('/api/predict/accident', methods=['POST'])
def predict_accident():
    data = request.json or {}
    speed = data.get("speed", 60.0)
    road_wetness = data.get("road_wetness", 0.1)
    visibility = data.get("visibility", 10.0)
    congestion = data.get("congestion", 0.3)
    hour = data.get("hour", 12)
    
    res = ml_system.predict_accident_risk(speed, road_wetness, visibility, congestion, hour)
    return jsonify(res)

@app.route('/api/route/optimize', methods=['POST'])
def optimize_route():
    data = request.json or {}
    start = data.get("start", "A")
    end = data.get("end", "I")
    
    # Recalculate using active congestion levels
    res = router.find_shortest_path(start, end, simulation_state["congestion_multipliers"])
    return jsonify(res)

@app.route('/api/admin/control', methods=['POST'])
def admin_control():
    data = request.json or {}
    
    if "weather" in data:
        simulation_state["weather"] = data["weather"]
        
    if "simulation_speed" in data:
        simulation_state["simulation_speed"] = float(data["simulation_speed"])
        
    if "incidents" in data:
        simulation_state["active_incidents"] = int(data["incidents"])
        
    if "congested_edges" in data:
        # List of edges to congest, format: [{"edge": "A-B", "level": 3.0}]
        multipliers = {}
        for edge_info in data["congested_edges"]:
            edge_name = edge_info["edge"]
            multiplier = float(edge_info["level"])
            multipliers[edge_name] = multiplier
        simulation_state["congestion_multipliers"] = multipliers
        
    return jsonify({"success": True, "state": {
        "weather": simulation_state["weather"],
        "simulation_speed": simulation_state["simulation_speed"],
        "active_incidents": simulation_state["active_incidents"],
        "congestion_multipliers": simulation_state["congestion_multipliers"]
    }})

# Pre-packaged Computer Vision Scenarios for YOLO / Classification / OCR
CV_SCENARIOS = {
    "highway": {
        "title": "Highway Traffic Cam 4",
        "objects": [
            {"class": "Car", "bbox": [120, 240, 80, 50], "confidence": 0.94},
            {"class": "Car", "bbox": [280, 260, 75, 48], "confidence": 0.91},
            {"class": "Truck", "bbox": [420, 180, 140, 120], "confidence": 0.88},
            {"class": "Motorcycle", "bbox": [80, 310, 40, 35], "confidence": 0.79}
        ],
        "ocr": {"plate": "CA-88D-5512", "confidence": 0.96, "bbox": [150, 275, 30, 10]}
    },
    "intersection": {
        "title": "Junction B CCTV",
        "objects": [
            {"class": "Bus", "bbox": [50, 150, 220, 130], "confidence": 0.97},
            {"class": "SUV", "bbox": [320, 220, 95, 65], "confidence": 0.93},
            {"class": "Car", "bbox": [450, 270, 70, 45], "confidence": 0.85}
        ],
        "ocr": {"plate": "TX-44P-8219", "confidence": 0.91, "bbox": [360, 265, 35, 12]}
    },
    "plate_close": {
        "title": "Toll Gate Zoom-in",
        "objects": [
            {"class": "Car", "bbox": [10, 10, 580, 480], "confidence": 0.99}
        ],
        "ocr": {"plate": "NY-73Z-1002", "confidence": 0.99, "bbox": [240, 310, 180, 60]}
    }
}

@app.route('/api/cv/analyze', methods=['POST'])
def cv_analyze():
    data = request.json or {}
    scenario = data.get("scenario", "highway")
    
    if scenario in CV_SCENARIOS:
        return jsonify(CV_SCENARIOS[scenario])
        
    # If the user uploads a custom file name or tests upload
    # Return a simulated result representing random classification
    mock_classes = ["Car", "SUV", "Truck", "Electric", "Motorcycle", "Bus"]
    random_class = random.choice(mock_classes)
    random_plate = f"US-{random.randint(10,99)}K-{random.randint(1000,9999)}"
    
    return jsonify({
        "title": "Uploaded Image Stream",
        "objects": [
            {"class": random_class, "bbox": [150, 180, 220, 150], "confidence": round(random.uniform(0.8, 0.98), 2)},
            {"class": "Car", "bbox": [380, 220, 120, 80], "confidence": round(random.uniform(0.7, 0.95), 2)}
        ],
        "ocr": {"plate": random_plate, "confidence": round(random.uniform(0.85, 0.99), 2), "bbox": [230, 290, 60, 20]}
    })

@app.route('/api/models/status', methods=['GET'])
def models_status():
    return jsonify({
        "models": {
            "maintenance_predictor": {
                "algorithm": "Random Forest Classifier",
                "features": ["mileage", "vibration", "engine_temp", "age"],
                "accuracy": 0.965,
                "n_estimators": 50,
                "status": "Active"
            },
            "accident_predictor": {
                "algorithm": "Random Forest (XGBoost Sim)",
                "features": ["speed", "road_wetness", "visibility", "congestion", "hour"],
                "accuracy": 0.942,
                "n_estimators": 50,
                "status": "Active"
            },
            "driver_profiler": {
                "algorithm": "K-Means Clustering",
                "features": ["avg_speed", "hard_brakes", "fuel_rate", "accel_variance"],
                "k": 4,
                "status": "Trained"
            },
            "yolo_detector": {
                "algorithm": "YOLO v8 Nano (Simulated)",
                "classes": ["Car", "SUV", "Truck", "Bus", "Motorcycle"],
                "fps": 45,
                "status": "Online"
            }
        }
    })

@app.route('/api/models/train', methods=['POST'])
def models_retrain():
    # Retrain models to simulate dashboard updates
    ml_system.train_models()
    return jsonify({
        "success": True,
        "message": "Models retrained successfully with fresh simulation records",
        "timestamp": time.time()
    })

if __name__ == '__main__':
    # Build folders if not exist
    os.makedirs('static', exist_ok=True)
    app.run(host='127.0.0.1', port=5000, debug=True)
