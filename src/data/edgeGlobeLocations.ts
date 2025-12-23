export type EdgeLocation = {
  id: string;
  label: string;
  provider: "Akamai" | "Linode";
  city: string;
  region?: string;
  lat: number;
  lng: number;
};

// Representative edge regions (not authoritative PoP listings).
export const EDGE_GLOBE_LOCATIONS: readonly EdgeLocation[] = [
  {
    id: "akamai-us-east",
    label: "US East",
    provider: "Akamai",
    city: "Ashburn",
    region: "US East",
    lat: 39.0,
    lng: -77.5,
  },
  {
    id: "linode-us-central",
    label: "US Central",
    provider: "Linode",
    city: "Chicago",
    region: "US Central",
    lat: 41.9,
    lng: -87.6,
  },
  {
    id: "akamai-us-west",
    label: "US West",
    provider: "Akamai",
    city: "Los Angeles",
    region: "US West",
    lat: 34.0,
    lng: -118.2,
  },
  {
    id: "linode-uk-london",
    label: "UK",
    provider: "Linode",
    city: "London",
    region: "UK",
    lat: 51.5,
    lng: -0.1,
  },
  {
    id: "akamai-eu-frankfurt",
    label: "EU",
    provider: "Akamai",
    city: "Frankfurt",
    region: "EU",
    lat: 50.1,
    lng: 8.7,
  },
  {
    id: "linode-apac-singapore",
    label: "APAC",
    provider: "Linode",
    city: "Singapore",
    region: "APAC",
    lat: 1.35,
    lng: 103.8,
  },
  {
    id: "akamai-apac-tokyo",
    label: "APAC",
    provider: "Akamai",
    city: "Tokyo",
    region: "APAC",
    lat: 35.7,
    lng: 139.7,
  },
  {
    id: "linode-au-sydney",
    label: "AU",
    provider: "Linode",
    city: "Sydney",
    region: "AU",
    lat: -33.9,
    lng: 151.2,
  },
  {
    id: "akamai-latam-sao-paulo",
    label: "LATAM",
    provider: "Akamai",
    city: "São Paulo",
    region: "LATAM",
    lat: -23.5,
    lng: -46.6,
  },
] as const;


