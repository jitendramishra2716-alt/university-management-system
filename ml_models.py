import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
import random
import os

class RoadPulseAI:
    def __init__(self):
        self.maintenance_model = None
        self.accident_model = None
        self.kmeans_model = None
        self.is_trained = False
        self.train_models()

    def train_models(self):
        """Generates synthetic data and trains the models."""
        print("Training RoadPulse ML Models...")
        
        # 1. Maintenance Prediction Model (Random Forest Classifier)
        # Features: mileage, vibration (mm/s), engine_temp (°C), age (years)
        # Output: 0 (Good), 1 (Needs Maintenance)
        np.random.seed(42)
        n_samples = 1000
        mileage = np.random.uniform(5000, 150000, n_samples)
        vibration = np.random.uniform(0.5, 8.0, n_samples)
        engine_temp = np.random.uniform(70, 120, n_samples)
        age = np.random.uniform(0.5, 12, n_samples)
        
        # Simple logical rules to determine failure probability
        maintenance_prob = (
            (mileage / 150000) * 0.4 +
            (vibration / 8.0) * 0.3 +
            ((engine_temp - 70) / 50) * 0.2 +
            (age / 12) * 0.1
        )
        # Threshold: if prob > 0.6, or extreme individual values
        y_maintenance = (maintenance_prob > 0.55) | (vibration > 6.5) | (engine_temp > 112)
        y_maintenance = y_maintenance.astype(int)
        
        X_maintenance = pd.DataFrame({
            'mileage': mileage,
            'vibration': vibration,
            'engine_temp': engine_temp,
            'age': age
        })
        
        self.maintenance_model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.maintenance_model.fit(X_maintenance, y_maintenance)
        
        # 2. Accident Risk Prediction Model (Random Forest Classifier)
        # Features: speed, road_wetness (0-1), visibility (km), congestion_index (0-1), hour (0-23)
        # Output: 0 (Low Risk), 1 (Medium Risk), 2 (High Risk)
        speed = np.random.uniform(10, 140, n_samples)
        road_wetness = np.random.uniform(0.0, 1.0, n_samples)
        visibility = np.random.uniform(1.0, 15.0, n_samples)
        congestion = np.random.uniform(0.0, 1.0, n_samples)
        hour = np.random.randint(0, 24, n_samples)
        
        # Rules for accident risk: nighttime, heavy rain, speed, congestion
        risk_score = (
            (speed / 140) * 0.3 +
            road_wetness * 0.25 +
            ((15.0 - visibility) / 14.0) * 0.2 +
            congestion * 0.15 +
            ((hour < 5) | (hour > 21)).astype(int) * 0.1
        )
        
        y_accident = np.zeros(n_samples)
        y_accident[risk_score > 0.4] = 1 # Medium
        y_accident[risk_score > 0.65] = 2 # High
        y_accident = y_accident.astype(int)
        
        X_accident = pd.DataFrame({
            'speed': speed,
            'road_wetness': road_wetness,
            'visibility': visibility,
            'congestion': congestion,
            'hour': hour
        })
        
        self.accident_model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.accident_model.fit(X_accident, y_accident)
        
        # 3. Vehicle Clustering Model (K-Means)
        # Features: avg_speed, hard_brakes_per_hour, fuel_rate (L/100km), accel_variance
        # Group into 4 clusters: Eco, Aggressive, Commuter, Commercial
        cluster_data = []
        for _ in range(n_samples):
            driver_type = random.choice(['eco', 'aggressive', 'commuter', 'commercial'])
            if driver_type == 'eco':
                avg_sp = random.uniform(40, 70)
                brakes = random.uniform(0, 1.5)
                fuel = random.uniform(5.0, 7.5)
                accel = random.uniform(0.1, 0.5)
            elif driver_type == 'aggressive':
                avg_sp = random.uniform(60, 110)
                brakes = random.uniform(5.0, 12.0)
                fuel = random.uniform(10.0, 16.0)
                accel = random.uniform(1.2, 3.5)
            elif driver_type == 'commercial':
                avg_sp = random.uniform(50, 85)
                brakes = random.uniform(1.0, 4.0)
                fuel = random.uniform(12.0, 22.0)  # Large trucks
                accel = random.uniform(0.3, 1.0)
            else: # commuter
                avg_sp = random.uniform(45, 80)
                brakes = random.uniform(1.0, 3.5)
                fuel = random.uniform(7.0, 9.5)
                accel = random.uniform(0.4, 1.2)
            
            cluster_data.append([avg_sp, brakes, fuel, accel])
            
        X_cluster = pd.DataFrame(cluster_data, columns=['avg_speed', 'hard_brakes', 'fuel_rate', 'accel_variance'])
        self.kmeans_model = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.kmeans_model.fit(X_cluster)
        
        self.is_trained = True
        print("RoadPulse ML Models trained successfully.")
        
    def predict_maintenance(self, mileage, vibration, engine_temp, age):
        """Predicts if a vehicle needs maintenance (returns dict)."""
        if not self.is_trained:
            return {"error": "Model not trained"}
        
        features = pd.DataFrame([{
            'mileage': float(mileage),
            'vibration': float(vibration),
            'engine_temp': float(engine_temp),
            'age': float(age)
        }])
        
        pred = int(self.maintenance_model.predict(features)[0])
        probs = self.maintenance_model.predict_proba(features)[0]
        
        return {
            "needs_maintenance": bool(pred == 1),
            "probability": float(probs[1]),
            "status": "Needs Maintenance" if pred == 1 else "Healthy"
        }
        
    def predict_accident_risk(self, speed, road_wetness, visibility, congestion, hour):
        """Predicts accident risk level (returns dict)."""
        if not self.is_trained:
            return {"error": "Model not trained"}
            
        features = pd.DataFrame([{
            'speed': float(speed),
            'road_wetness': float(road_wetness),
            'visibility': float(visibility),
            'congestion': float(congestion),
            'hour': int(hour)
        }])
        
        pred = int(self.accident_model.predict(features)[0])
        probs = self.accident_model.predict_proba(features)[0]
        
        labels = ["Low Risk", "Medium Risk", "High Risk"]
        return {
            "risk_level": labels[pred],
            "risk_code": pred,
            "probabilities": [float(p) for p in probs]
        }
        
    def classify_driver(self, avg_speed, hard_brakes, fuel_rate, accel_variance):
        """Classifies driver behavior using K-Means."""
        if not self.is_trained:
            return {"error": "Model not trained"}
            
        features = pd.DataFrame([{
            'avg_speed': float(avg_speed),
            'hard_brakes': float(hard_brakes),
            'fuel_rate': float(fuel_rate),
            'accel_variance': float(accel_variance)
        }])
        
        cluster = int(self.kmeans_model.predict(features)[0])
        
        # Map cluster centers to profiles
        # In a real environment, we'd label centroids. Here we use preset names for UI representation.
        # We can map them consistently. Let's see where the centroid fits.
        centers = self.kmeans_model.cluster_centers_
        # Find which cluster matches which category by average fuel_rate and hard brakes
        # Let's dynamically map them based on fuel rate
        sorted_indices = np.argsort(centers[:, 2]) # Sort by fuel_rate
        
        # Eco-Driver: lowest fuel
        # Standard Commuter: second lowest fuel
        # Aggressive Driver: highest hard brakes or third lowest fuel
        # Commercial / Heavy vehicle: highest fuel
        
        mapping = {}
        mapping[sorted_indices[0]] = {
            "type": "Eco-Driver",
            "description": "Smooth driving, excellent fuel economy, low brakes.",
            "color": "#10B981" # green
        }
        mapping[sorted_indices[1]] = {
            "type": "Standard Commuter",
            "description": "Normal urban commuting, moderate speed, standard fuel usage.",
            "color": "#3B82F6" # blue
        }
        # Check between the remaining two: which one has higher hard brakes?
        idx2 = sorted_indices[2]
        idx3 = sorted_indices[3]
        if centers[idx2, 1] > centers[idx3, 1]:
            agg_idx = idx2
            comm_idx = idx3
        else:
            agg_idx = idx3
            comm_idx = idx2
            
        mapping[agg_idx] = {
            "type": "Aggressive Driver",
            "description": "High acceleration variance, frequent hard brakes, high fuel burn.",
            "color": "#EF4444" # red
        }
        mapping[comm_idx] = {
            "type": "Commercial Carrier",
            "description": "High average speeds, heavy engine loads, consistent cruising.",
            "color": "#F59E0B" # yellow
        }
        
        return {
            "cluster_id": cluster,
            "profile": mapping.get(cluster, {"type": "Standard", "description": "Typical driving profile.", "color": "#3B82F6"})
        }

    def get_clustering_points(self):
        """Returns sample points for plotting clusters in 2D (avg_speed vs fuel_rate)."""
        # Let's take a sample of 100 points to plot
        random.seed(42)
        indices = random.sample(range(1000), 150)
        # Re-run clustering to return labeled coordinates
        # We will return the data as points
        return [] # We'll populate this dynamically in app.py if requested.
