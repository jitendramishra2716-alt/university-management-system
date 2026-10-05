import heapq

class RouteOptimizer:
    def __init__(self):
        # Coordinates of junctions in a 600x600 canvas coordinate system
        self.nodes = {
            'A': {'x': 100, 'y': 100, 'name': 'West Junction'},
            'B': {'x': 300, 'y': 100, 'name': 'North Expressway'},
            'C': {'x': 500, 'y': 100, 'name': 'East Junction'},
            'D': {'x': 100, 'y': 300, 'name': 'Industrial Blvd'},
            'E': {'x': 300, 'y': 300, 'name': 'Central Plaza'},
            'F': {'x': 500, 'y': 300, 'name': 'Business Park'},
            'G': {'x': 100, 'y': 500, 'name': 'Port Terminal'},
            'H': {'x': 300, 'y': 500, 'name': 'South Expressway'},
            'I': {'x': 500, 'y': 500, 'name': 'Residential hub'},
            'J': {'x': 300, 'y': 200, 'name': 'Skyline Boulevard'}
        }
        
        # Base distances between connected nodes (undirected graph representation)
        self.base_edges = {
            'A': {'B': 200, 'D': 200},
            'B': {'A': 200, 'C': 200, 'E': 200, 'J': 100},
            'C': {'B': 200, 'F': 200},
            'D': {'A': 200, 'E': 200, 'G': 200},
            'E': {'B': 200, 'D': 200, 'F': 200, 'H': 200, 'J': 100},
            'F': {'C': 200, 'E': 200, 'I': 200},
            'G': {'D': 200, 'H': 200},
            'H': {'E': 200, 'G': 200, 'I': 200},
            'I': {'F': 200, 'H': 200},
            'J': {'B': 100, 'E': 100}
        }
        
    def find_shortest_path(self, start, end, congestion_levels=None):
        """
        Computes the shortest/optimal path using Dijkstra's algorithm.
        congestion_levels: dictionary key: 'A-B' or 'B-A' -> multiplier (e.g. 2.5 for heavy congestion)
        """
        if start not in self.nodes or end not in self.nodes:
            return {"error": "Invalid start or end node"}
            
        if congestion_levels is None:
            congestion_levels = {}
            
        # Create adjacency list with dynamically adjusted weights
        graph = {}
        for u in self.base_edges:
            graph[u] = {}
            for v, dist in self.base_edges[u].items():
                # Check for congestion factor
                edge_key = f"{u}-{v}"
                alt_edge_key = f"{v}-{u}"
                
                multiplier = 1.0
                if edge_key in congestion_levels:
                    multiplier = congestion_levels[edge_key]
                elif alt_edge_key in congestion_levels:
                    multiplier = congestion_levels[alt_edge_key]
                    
                graph[u][v] = dist * multiplier
                
        # Dijkstra's Algorithm
        queue = [(0, start, [])]
        seen = set()
        mins = {start: 0}
        
        while queue:
            (cost, v1, path) = heapq.heappop(queue)
            if v1 in seen:
                continue
                
            seen.add(v1)
            path = path + [v1]
            
            if v1 == end:
                # Compile path details
                path_coords = [{'node': n, 'x': self.nodes[n]['x'], 'y': self.nodes[n]['y']} for n in path]
                
                # Compute ETA in minutes (assuming base speed of 40 km/h, cost is base distance in meters)
                # cost represents travel cost where 1 unit = approx 0.05 seconds or 3 seconds in simulation time.
                # Let's say cost is travel time in seconds:
                eta = round(cost / 10, 1) # ETA representation
                return {
                    "path": path,
                    "coords": path_coords,
                    "travel_time_score": round(cost, 1),
                    "eta_minutes": eta,
                    "success": True
                }
                
            for v2, weight in graph.get(v1, {}).items():
                if v2 in seen:
                    continue
                prev = mins.get(v2, None)
                next_cost = cost + weight
                if prev is None or next_cost < prev:
                    mins[v2] = next_cost
                    heapq.heappush(queue, (next_cost, v2, path))
                    
        return {"error": "No path found", "success": False}
        
    def get_map_data(self):
        """Returns the full node coordinates and edge list for rendering on frontend."""
        edges_list = []
        visited = set()
        for u in self.base_edges:
            for v, dist in self.base_edges[u].items():
                edge_id = "-".join(sorted([u, v]))
                if edge_id not in visited:
                    visited.add(edge_id)
                    edges_list.append({
                        'from': u,
                        'to': v,
                        'from_coords': {'x': self.nodes[u]['x'], 'y': self.nodes[u]['y']},
                        'to_coords': {'x': self.nodes[v]['x'], 'y': self.nodes[v]['y']},
                        'base_distance': dist
                    })
        return {
            'nodes': self.nodes,
            'edges': edges_list
        }
