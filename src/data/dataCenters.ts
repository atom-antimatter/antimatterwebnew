export type DataCenter = {
  name: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
};

/** Sample data center locations for the 3D globe map. */
export const DATA_CENTERS: readonly DataCenter[] = [
  { name: "Equinix DC1", lat: 38.9072, lng: -77.0369, city: "Washington", country: "USA" },
  { name: "Telehouse North", lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
  { name: "Global Switch SG", lat: 1.3521, lng: 103.8198, city: "Singapore", country: "Singapore" },
] as const;
