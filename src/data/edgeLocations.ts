export type EdgeLocation = {
  name: string;
  lat: number;
  lon: number;
};

export const EDGE_LOCATIONS: readonly EdgeLocation[] = [
  { name: "Newark", lat: 40.7357, lon: -74.1724 },
  { name: "Washington, DC", lat: 38.9072, lon: -77.0369 },
  { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "Dallas", lat: 32.7767, lon: -96.797 },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Frankfurt", lat: 50.1109, lon: 8.6821 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
] as const;


