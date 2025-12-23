export type EdgeLocation = {
  name: string;
  lat: number;
  lon: number;
};

// Representative global edge regions (approximate coordinates).
export const EDGE_LOCATIONS: readonly EdgeLocation[] = [
  { name: "US West", lat: 37.7749, lon: -122.4194 },
  { name: "US Central", lat: 32.7767, lon: -96.797 },
  { name: "US East", lat: 38.9072, lon: -77.0369 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Frankfurt", lat: 50.1109, lon: 8.6821 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
] as const;


