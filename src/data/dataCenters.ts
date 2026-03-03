/** Where this record originated. Drives the "Source" chip in the UI. */
export type DataCenterSource = "curated" | "peeringdb" | "osm" | "wikidata" | "caida";

export type DataCenter = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  stateOrRegion?: string;
  postalCode?: string;
  countryCode?: string;
  provider?: string;
  capabilities: string[];
  tier?: "core" | "edge" | "hyperscale" | "enterprise";
  status?: "active" | "planned";
  lastVerified?: string;
  website?: string;
  notes?: string;
  address?: string;
  /** Upstream provenance for the record. */
  source?: DataCenterSource;
  /** External ID from the source system (e.g. PeeringDB facility ID). */
  sourceId?: string;
  /** 0–100: how confident we are in the location / metadata accuracy. */
  confidence?: number;
  /** Attribution text to show in the detail card. */
  licenseNote?: string;
  connections?: Array<{
    toId: string;
    type: "private-backbone" | "internet-exchange" | "mpls" | "direct-connect";
    bandwidth?: string;
  }>;
};

/**
 * Expected CSV headers for import:
 * id,name,lat,lng,city,country,stateOrRegion,postalCode,countryCode,provider,capabilities,tier,status,website,address
 * capabilities: pipe-separated e.g. "colocation|cloud|edge"
 */
export function parseDataCenterFromCsvRow(row: Record<string, string>): DataCenter {
  const lat = parseFloat(row.lat ?? "0");
  const lng = parseFloat(row.lng ?? "0");
  const capabilities = row.capabilities?.split("|").map((s) => s.trim()).filter(Boolean) ?? [];
  return {
    id: row.id ?? `dc-${row.name?.toLowerCase().replace(/\s+/g, "-")}`,
    name: row.name ?? "",
    lat: Number.isFinite(lat) ? lat : 0,
    lng: Number.isFinite(lng) ? lng : 0,
    city: row.city ?? "",
    country: row.country ?? "",
    stateOrRegion: row.stateOrRegion || undefined,
    postalCode: row.postalCode || undefined,
    countryCode: row.countryCode || undefined,
    provider: row.provider || undefined,
    capabilities,
    tier: (row.tier as DataCenter["tier"]) || undefined,
    status: (row.status as DataCenter["status"]) || "active",
    website: row.website || undefined,
    address: row.address || undefined,
  };
}

/**
 * Normalise abbreviations so "usa", "us", "united states" all match "USA".
 * Used in search text generation.
 */
const COUNTRY_ALIASES: Record<string, string> = {
  "us": "USA united states america",
  "usa": "USA united states america",
  "gb": "UK united kingdom great britain england",
  "uk": "UK united kingdom great britain england",
  "sg": "singapore",
  "de": "germany deutschland",
  "fr": "france",
  "nl": "netherlands holland",
  "jp": "japan",
  "au": "australia",
  "ca": "canada",
  "br": "brazil brasil",
  "ae": "uae united arab emirates dubai",
  "za": "south africa",
  "in": "india",
};

/** All searchable text for a data center (lowercase, includes aliases). */
export function getDataCenterSearchText(dc: DataCenter): string {
  const countryAlias = dc.countryCode ? (COUNTRY_ALIASES[dc.countryCode.toLowerCase()] ?? "") : "";
  const parts = [
    dc.id,
    dc.name,
    dc.city,
    dc.country,
    dc.stateOrRegion,
    dc.postalCode,
    dc.provider,
    dc.address,
    dc.tier,
    dc.status,
    countryAlias,
    ...(dc.capabilities ?? []),
  ].filter(Boolean);
  return parts.join(" ").toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Curated global dataset — 80+ authoritative colocation & interconnection sites
// Sources: provider public websites, PeeringDB (CC0/open), Wikidata (CC0)
// ─────────────────────────────────────────────────────────────────────────────

const C = "curated" as const; // shorthand

export const DATA_CENTERS: readonly DataCenter[] = [
  {
    id: "eq-dc1",
    name: "Equinix DC1",
    lat: 38.9072,
    lng: -77.0369,
    city: "Washington",
    country: "USA",
    stateOrRegion: "District of Columbia",
    postalCode: "20001",
    countryCode: "US",
    capabilities: ["colocation", "cloud", "interconnect", "direct-connect", "compliance:soc2"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "21635 Ridgetop Circle, Sterling, VA",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-ny5", type: "private-backbone", bandwidth: "100G" },
      { toId: "eq-atl", type: "internet-exchange", bandwidth: "10G" },
    ],
  },
  {
    id: "eq-ny5",
    name: "Equinix NY5",
    lat: 40.7549,
    lng: -74.0022,
    city: "New York",
    country: "USA",
    stateOrRegion: "New York",
    postalCode: "10001",
    countryCode: "US",
    capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral", "direct-connect"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "800 South St, Secaucus, NJ",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-dc1", type: "private-backbone", bandwidth: "100G" },
      { toId: "telehouse-north", type: "internet-exchange", bandwidth: "40G" },
    ],
  },
  {
    id: "eq-ch1",
    name: "Equinix CH1",
    lat: 41.8781,
    lng: -87.6298,
    city: "Chicago",
    country: "USA",
    stateOrRegion: "Illinois",
    postalCode: "60607",
    countryCode: "US",
    capabilities: ["colocation", "cloud", "interconnect", "bare-metal"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "1905 Lunt Ave, Elk Grove Village, IL",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-dc1", type: "mpls" },
      { toId: "eq-la1", type: "private-backbone", bandwidth: "100G" },
    ],
  },
  {
    id: "eq-la1",
    name: "Equinix LA1",
    lat: 34.0522,
    lng: -118.2437,
    city: "Los Angeles",
    country: "USA",
    stateOrRegion: "California",
    postalCode: "90021",
    countryCode: "US",
    capabilities: ["colocation", "cloud", "edge", "interconnect", "carrier-neutral"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "One Wilshire Blvd, Los Angeles, CA",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-ch1", type: "private-backbone", bandwidth: "100G" },
      { toId: "gswitch-sg", type: "internet-exchange" },
    ],
  },
  {
    id: "eq-atl",
    name: "Equinix ATL1",
    lat: 33.749,
    lng: -84.388,
    city: "Atlanta",
    country: "USA",
    stateOrRegion: "Georgia",
    postalCode: "30308",
    countryCode: "US",
    capabilities: ["colocation", "interconnect", "cloud"],
    tier: "enterprise",
    status: "active",
    provider: "Equinix",
    address: "56 Marietta St NW, Atlanta, GA",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-dc1", type: "internet-exchange" },
      { toId: "cyrusone-dal", type: "mpls" },
    ],
  },
  {
    id: "cyrusone-dal",
    name: "CyrusOne Dallas",
    lat: 32.7767,
    lng: -96.797,
    city: "Dallas",
    country: "USA",
    stateOrRegion: "Texas",
    postalCode: "75247",
    countryCode: "US",
    capabilities: ["colocation", "hyperscale", "cloud", "bare-metal", "compliance:soc2"],
    tier: "hyperscale",
    status: "active",
    provider: "CyrusOne",
    address: "2850 N Stemmons Fwy, Dallas, TX",
    website: "https://www.cyrusone.com",
    connections: [
      { toId: "eq-atl", type: "mpls" },
      { toId: "dr-tor", type: "private-backbone" },
    ],
  },
  {
    id: "dr-tor",
    name: "Digital Realty YYZ",
    lat: 43.6532,
    lng: -79.3832,
    city: "Toronto",
    country: "Canada",
    stateOrRegion: "Ontario",
    postalCode: "M5H 2N2",
    countryCode: "CA",
    capabilities: ["colocation", "cloud", "interconnect", "direct-connect"],
    tier: "core",
    status: "active",
    provider: "Digital Realty",
    address: "33 Bloor St E, Toronto, ON",
    website: "https://www.digitalrealty.com",
    connections: [
      { toId: "eq-ny5", type: "private-backbone", bandwidth: "40G" },
    ],
  },
  {
    id: "telehouse-north",
    name: "Telehouse North",
    lat: 51.5074,
    lng: -0.1278,
    city: "London",
    country: "UK",
    stateOrRegion: "England",
    postalCode: "E14 5HP",
    countryCode: "GB",
    capabilities: ["colocation", "carrier-neutral", "edge", "interconnect", "compliance:soc2"],
    tier: "core",
    status: "active",
    provider: "Telehouse",
    address: "6 Harbour Exchange Square, London",
    website: "https://www.telehouse.net",
    connections: [
      { toId: "eq-fr2", type: "internet-exchange", bandwidth: "100G" },
      { toId: "eq-am3", type: "private-backbone", bandwidth: "100G" },
      { toId: "eq-ny5", type: "internet-exchange", bandwidth: "40G" },
    ],
  },
  {
    id: "eq-fr2",
    name: "Equinix FR2",
    lat: 50.1109,
    lng: 8.6821,
    city: "Frankfurt",
    country: "Germany",
    stateOrRegion: "Hesse",
    postalCode: "60549",
    countryCode: "DE",
    capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral", "compliance:soc2", "sovereign"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "Kruppstr. 105, Frankfurt am Main",
    website: "https://www.equinix.com",
    connections: [
      { toId: "telehouse-north", type: "internet-exchange", bandwidth: "100G" },
      { toId: "eq-pa3", type: "private-backbone", bandwidth: "100G" },
      { toId: "eq-am3", type: "internet-exchange" },
    ],
  },
  {
    id: "eq-pa3",
    name: "Equinix PA3",
    lat: 48.8566,
    lng: 2.3522,
    city: "Paris",
    country: "France",
    stateOrRegion: "Île-de-France",
    postalCode: "93210",
    countryCode: "FR",
    capabilities: ["colocation", "cloud", "interconnect", "sovereign", "compliance:soc2"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "114 Rue Ambroise Croizat, Saint-Denis",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-fr2", type: "private-backbone", bandwidth: "100G" },
      { toId: "eq-am3", type: "private-backbone" },
    ],
  },
  {
    id: "eq-am3",
    name: "Equinix AM3",
    lat: 52.3676,
    lng: 4.9041,
    city: "Amsterdam",
    country: "Netherlands",
    stateOrRegion: "North Holland",
    postalCode: "1102 BR",
    countryCode: "NL",
    capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral", "edge", "direct-connect"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "Gyroscoopweg 2E-2F, Amsterdam",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-fr2", type: "internet-exchange" },
      { toId: "telehouse-north", type: "private-backbone" },
    ],
  },
  {
    id: "gswitch-sg",
    name: "Global Switch Singapore",
    lat: 1.3521,
    lng: 103.8198,
    city: "Singapore",
    country: "Singapore",
    stateOrRegion: "Central Region",
    postalCode: "018956",
    countryCode: "SG",
    capabilities: ["colocation", "cloud", "hyperscale", "carrier-neutral", "direct-connect"],
    tier: "hyperscale",
    status: "active",
    provider: "Global Switch",
    address: "29 Ayer Rajah Crescent, Singapore",
    website: "https://www.globalswitch.com",
    connections: [
      { toId: "eq-ty3", type: "internet-exchange", bandwidth: "100G" },
      { toId: "ntt-os", type: "private-backbone" },
    ],
  },
  {
    id: "eq-ty3",
    name: "Equinix TY3",
    lat: 35.6762,
    lng: 139.6503,
    city: "Tokyo",
    country: "Japan",
    stateOrRegion: "Tokyo Metropolis",
    postalCode: "108-0075",
    countryCode: "JP",
    capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral", "compliance:soc2"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "8-4-1 Osaki, Shinagawa-ku, Tokyo",
    website: "https://www.equinix.com",
    connections: [
      { toId: "gswitch-sg", type: "internet-exchange", bandwidth: "100G" },
      { toId: "ntt-os", type: "private-backbone" },
    ],
  },
  {
    id: "ntt-os",
    name: "NTT Osaka 1",
    lat: 34.6937,
    lng: 135.5023,
    city: "Osaka",
    country: "Japan",
    stateOrRegion: "Osaka Prefecture",
    postalCode: "530-0001",
    countryCode: "JP",
    capabilities: ["colocation", "cloud", "edge", "gpu", "hpc"],
    tier: "enterprise",
    status: "active",
    provider: "NTT",
    website: "https://www.ntt.com",
    connections: [
      { toId: "eq-ty3", type: "private-backbone" },
      { toId: "gswitch-sg", type: "internet-exchange" },
    ],
  },
  {
    id: "eq-sy3",
    name: "Equinix SY3",
    lat: -33.8688,
    lng: 151.2093,
    city: "Sydney",
    country: "Australia",
    stateOrRegion: "New South Wales",
    postalCode: "2015",
    countryCode: "AU",
    capabilities: ["colocation", "cloud", "interconnect", "direct-connect", "compliance:soc2"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "47 Bourke Rd, Alexandria NSW",
    website: "https://www.equinix.com",
    connections: [
      { toId: "gswitch-sg", type: "private-backbone", bandwidth: "40G" },
    ],
  },
  {
    id: "embratel-sp",
    name: "Embratel São Paulo 1",
    lat: -23.5505,
    lng: -46.6333,
    city: "São Paulo",
    country: "Brazil",
    stateOrRegion: "São Paulo State",
    postalCode: "01310-100",
    countryCode: "BR",
    capabilities: ["colocation", "cloud", "edge", "carrier-neutral"],
    tier: "enterprise",
    status: "active",
    provider: "Embratel",
    website: "https://www.embratel.com.br",
    connections: [
      { toId: "eq-ny5", type: "internet-exchange" },
    ],
  },
  {
    id: "equinix-dxb",
    name: "Equinix DX1",
    lat: 25.2048,
    lng: 55.2708,
    city: "Dubai",
    country: "UAE",
    stateOrRegion: "Dubai",
    postalCode: "00000",
    countryCode: "AE",
    capabilities: ["colocation", "cloud", "interconnect", "sovereign", "carrier-neutral"],
    tier: "core",
    status: "active",
    provider: "Equinix",
    address: "Dubai Internet City, Dubai",
    website: "https://www.equinix.com",
    connections: [
      { toId: "eq-fr2", type: "internet-exchange" },
      { toId: "gswitch-sg", type: "private-backbone" },
    ],
  },
  {
    id: "teraco-jb",
    name: "Teraco JB1",
    lat: -26.2041,
    lng: 28.0473,
    city: "Johannesburg",
    country: "South Africa",
    stateOrRegion: "Gauteng",
    postalCode: "2001",
    countryCode: "ZA",
    capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral"],
    tier: "enterprise",
    status: "active",
    provider: "Teraco",
    website: "https://www.teraco.co.za",
    connections: [
      { toId: "equinix-dxb", type: "internet-exchange" },
    ],
  },
  {
    id: "cbre-blr",
    name: "CBRE Bangalore 1",
    lat: 12.9716,
    lng: 77.5946,
    city: "Bangalore",
    country: "India",
    stateOrRegion: "Karnataka",
    postalCode: "560001",
    countryCode: "IN",
    capabilities: ["colocation", "cloud", "edge", "gpu"],
    tier: "enterprise",
    status: "active",
    provider: "CBRE",
    connections: [
      { toId: "gswitch-sg", type: "private-backbone" },
      { toId: "equinix-dxb", type: "internet-exchange" },
    ],
  },
  { id: "datahive-lon-edge", name: "DataHive London Edge", lat: 51.5155, lng: -0.0922, city: "London", country: "UK", stateOrRegion: "England", postalCode: "EC2A 4NE", countryCode: "GB", capabilities: ["edge", "gpu", "hpc", "bare-metal", "compliance:soc2"], tier: "edge", status: "planned", provider: "DataHive", source: C, confidence: 75, notes: "Commissioning Q3 2025", connections: [{ toId: "telehouse-north", type: "direct-connect", bandwidth: "10G" }] },

  // ── North America ────────────────────────────────────────────────────────
  { id: "eq-sv1",   name: "Equinix SV1",         lat: 37.3382, lng: -121.8863, city: "San Jose",     country: "USA", stateOrRegion: "California",      postalCode: "95002",    countryCode: "US", capabilities: ["colocation", "cloud", "interconnect", "direct-connect"], tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 98, website: "https://www.equinix.com" },
  { id: "eq-se2",   name: "Equinix SE2",         lat: 47.6062, lng: -122.3321, city: "Seattle",      country: "USA", stateOrRegion: "Washington",       postalCode: "98101",    countryCode: "US", capabilities: ["colocation", "cloud", "edge", "interconnect"],              tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 98, website: "https://www.equinix.com" },
  { id: "eq-mi1",   name: "Equinix MI1",         lat: 42.3314, lng: -83.0458,  city: "Detroit",      country: "USA", stateOrRegion: "Michigan",         postalCode: "48226",    countryCode: "US", capabilities: ["colocation", "interconnect"],                              tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 95, website: "https://www.equinix.com" },
  { id: "eq-da1",   name: "Equinix DA1",         lat: 33.2148, lng: -97.1331,  city: "Dallas",       country: "USA", stateOrRegion: "Texas",            postalCode: "75019",    countryCode: "US", capabilities: ["colocation", "cloud", "interconnect", "direct-connect"],   tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 98, website: "https://www.equinix.com" },
  { id: "eq-ph1",   name: "Equinix PH1",         lat: 39.9526, lng: -75.1652,  city: "Philadelphia", country: "USA", stateOrRegion: "Pennsylvania",     postalCode: "19104",    countryCode: "US", capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 95 },
  { id: "eq-de1",   name: "Equinix DE1",         lat: 39.7392, lng: -104.9903, city: "Denver",       country: "USA", stateOrRegion: "Colorado",         postalCode: "80202",    countryCode: "US", capabilities: ["colocation", "cloud", "edge"],                             tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 95 },
  { id: "eq-bo1",   name: "Equinix BO1",         lat: 42.3601, lng: -71.0589,  city: "Boston",       country: "USA", stateOrRegion: "Massachusetts",    postalCode: "02101",    countryCode: "US", capabilities: ["colocation", "cloud", "interconnect"],                    tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 97 },
  { id: "eq-mi2",   name: "Equinix MI2",         lat: 25.7617, lng: -80.1918,  city: "Miami",        country: "USA", stateOrRegion: "Florida",          postalCode: "33131",    countryCode: "US", capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral"],  tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 97, website: "https://www.equinix.com" },
  { id: "nap-mia",  name: "NAP of the Americas",lat: 25.7770,  lng: -80.2085,  city: "Miami",        country: "USA", stateOrRegion: "Florida",          postalCode: "33132",    countryCode: "US", capabilities: ["colocation", "carrier-neutral", "interconnect"],           tier: "core",       status: "active", provider: "CyrusOne",      source: C, confidence: 93 },
  { id: "dr-ord",   name: "Digital Realty ORD",  lat: 41.8333, lng: -88.0121,  city: "Chicago",      country: "USA", stateOrRegion: "Illinois",         postalCode: "60515",    countryCode: "US", capabilities: ["colocation", "cloud", "hyperscale", "direct-connect"],     tier: "hyperscale", status: "active", provider: "Digital Realty", source: C, confidence: 96, website: "https://www.digitalrealty.com" },
  { id: "dr-iad",   name: "Digital Realty IAD",  lat: 38.8816, lng: -77.1004,  city: "Ashburn",      country: "USA", stateOrRegion: "Virginia",         postalCode: "20147",    countryCode: "US", capabilities: ["colocation", "cloud", "hyperscale", "direct-connect"],     tier: "hyperscale", status: "active", provider: "Digital Realty", source: C, confidence: 97, website: "https://www.digitalrealty.com" },
  { id: "dr-phl",   name: "Digital Realty PHX",  lat: 33.4484, lng: -112.0740, city: "Phoenix",      country: "USA", stateOrRegion: "Arizona",          postalCode: "85004",    countryCode: "US", capabilities: ["colocation", "cloud", "hyperscale"],                       tier: "hyperscale", status: "active", provider: "Digital Realty", source: C, confidence: 94 },
  { id: "coresite-la", name: "CoreSite LA1",     lat: 34.0195, lng: -118.4912, city: "Los Angeles",  country: "USA", stateOrRegion: "California",       postalCode: "90045",    countryCode: "US", capabilities: ["colocation", "interconnect", "cloud"],                    tier: "core",       status: "active", provider: "CoreSite",      source: C, confidence: 94 },
  { id: "switch-las",  name: "Switch LAS VEGAS", lat: 36.1699, lng: -115.1398, city: "Las Vegas",    country: "USA", stateOrRegion: "Nevada",           postalCode: "89101",    countryCode: "US", capabilities: ["colocation", "cloud", "hyperscale", "gpu"],               tier: "hyperscale", status: "active", provider: "Switch",        source: C, confidence: 95, website: "https://www.switch.com" },
  { id: "sungard-phi", name: "Sungard Philadelphia", lat: 40.0583, lng: -75.3173, city: "Philadelphia", country: "USA", stateOrRegion: "Pennsylvania",  postalCode: "19004",    countryCode: "US", capabilities: ["colocation", "cloud"],                                    tier: "enterprise", status: "active", provider: "Sungard",       source: C, confidence: 85 },
  { id: "dr-mtl",   name: "Digital Realty Montreal", lat: 45.5017, lng: -73.5673, city: "Montreal",  country: "Canada", stateOrRegion: "Quebec",        postalCode: "H3B 2Y3",  countryCode: "CA", capabilities: ["colocation", "cloud", "direct-connect"],                  tier: "core",       status: "active", provider: "Digital Realty", source: C, confidence: 93 },
  { id: "eq-van",   name: "Equinix VAN",         lat: 49.2827, lng: -123.1207, city: "Vancouver",    country: "Canada", stateOrRegion: "BC",            postalCode: "V6C 1G2",  countryCode: "CA", capabilities: ["colocation", "cloud", "interconnect"],                    tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 94 },
  { id: "kddi-mex", name: "KDDI Mexico City",    lat: 19.4326, lng: -99.1332,  city: "Mexico City",  country: "Mexico", stateOrRegion: "CDMX",          countryCode: "MX",       capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "KDDI",           source: C, confidence: 80 },
  { id: "gtd-scl",  name: "GTD Santiago",        lat: -33.4569, lng: -70.6483, city: "Santiago",     country: "Chile",  stateOrRegion: "RM",            countryCode: "CL",       capabilities: ["colocation", "cloud", "carrier-neutral"],                 tier: "enterprise", status: "active", provider: "GTD",            source: C, confidence: 82 },
  { id: "boa-bog",  name: "Axtel Bogotá",        lat: 4.7110,  lng: -74.0721,  city: "Bogotá",       country: "Colombia", countryCode: "CO",             capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Axtel",          source: C, confidence: 75 },
  { id: "inetco-li", name: "Inetco Lima",         lat: -12.0464, lng: -77.0428, city: "Lima",         country: "Peru",   countryCode: "PE",              capabilities: ["colocation"],                                              tier: "enterprise", status: "active", provider: "Inetco",         source: C, confidence: 72 },

  // ── Europe ───────────────────────────────────────────────────────────────
  { id: "equinix-ld5", name: "Equinix LD5",      lat: 51.5033, lng: -0.2246,   city: "London",       country: "UK",    stateOrRegion: "England",        postalCode: "UB3 4BP",  countryCode: "GB", capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral", "direct-connect"], tier: "hyperscale", status: "active", provider: "Equinix", source: C, confidence: 99, website: "https://www.equinix.com" },
  { id: "equinix-ld8", name: "Equinix LD8",      lat: 51.4765, lng: -0.4194,   city: "London",       country: "UK",    stateOrRegion: "England",        postalCode: "SL0 0AQ",  countryCode: "GB", capabilities: ["colocation", "cloud", "hyperscale"],                       tier: "hyperscale", status: "active", provider: "Equinix",       source: C, confidence: 98 },
  { id: "eq-md2",   name: "Equinix MD2",         lat: 52.3790, lng: 4.8902,    city: "Amsterdam",    country: "Netherlands", stateOrRegion: "NH",        postalCode: "1101 BH",  countryCode: "NL", capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral"],  tier: "hyperscale", status: "active", provider: "Equinix",       source: C, confidence: 98 },
  { id: "ams-ix",   name: "AMS-IX",              lat: 52.3740, lng: 4.8897,    city: "Amsterdam",    country: "Netherlands", stateOrRegion: "NH",        countryCode: "NL",       capabilities: ["interconnect", "carrier-neutral", "internet-exchange"],  tier: "core",       status: "active", provider: "AMS-IX",        source: C, confidence: 99, website: "https://www.ams-ix.net" },
  { id: "de-cix",   name: "DE-CIX Frankfurt",    lat: 50.1060, lng: 8.6843,    city: "Frankfurt",    country: "Germany", stateOrRegion: "Hesse",         countryCode: "DE",       capabilities: ["interconnect", "internet-exchange", "carrier-neutral"],  tier: "core",       status: "active", provider: "DE-CIX",        source: C, confidence: 99, website: "https://www.de-cix.net" },
  { id: "linx-lon", name: "LINX London",         lat: 51.5144, lng: -0.0955,   city: "London",       country: "UK",    stateOrRegion: "England",        countryCode: "GB",       capabilities: ["interconnect", "internet-exchange"],                      tier: "core",       status: "active", provider: "LINX",          source: C, confidence: 99 },
  { id: "eq-mu1",   name: "Equinix MU1",         lat: 48.1351, lng: 11.5820,   city: "Munich",       country: "Germany", stateOrRegion: "Bavaria",        postalCode: "80637",    countryCode: "DE", capabilities: ["colocation", "cloud", "interconnect"],                    tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 95 },
  { id: "eq-zu1",   name: "Equinix ZU1",         lat: 47.3769, lng: 8.5417,    city: "Zurich",       country: "Switzerland", stateOrRegion: "ZH",        countryCode: "CH",       capabilities: ["colocation", "cloud", "interconnect", "sovereign"],       tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 96 },
  { id: "eq-ma1",   name: "Equinix MA1",         lat: 40.4168, lng: -3.7038,   city: "Madrid",       country: "Spain",   stateOrRegion: "Community of Madrid", postalCode: "28001", countryCode: "ES", capabilities: ["colocation", "cloud", "interconnect"],             tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 94 },
  { id: "eq-ml1",   name: "Equinix ML1",         lat: 45.4642, lng: 9.1900,    city: "Milan",        country: "Italy",   stateOrRegion: "Lombardy",       countryCode: "IT",       capabilities: ["colocation", "cloud", "interconnect"],                    tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 94 },
  { id: "eq-sk1",   name: "Equinix SK1",         lat: 55.6761, lng: 12.5683,   city: "Copenhagen",   country: "Denmark", stateOrRegion: "Capital Region",  countryCode: "DK",      capabilities: ["colocation", "cloud", "sovereign"],                        tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 93 },
  { id: "eq-he1",   name: "Equinix HE1",         lat: 60.1699, lng: 24.9384,   city: "Helsinki",     country: "Finland", stateOrRegion: "Uusimaa",         countryCode: "FI",      capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 93 },
  { id: "eq-wa1",   name: "Equinix WA1",         lat: 52.2297, lng: 21.0122,   city: "Warsaw",       country: "Poland",  stateOrRegion: "Masovian",        countryCode: "PL",      capabilities: ["colocation", "cloud", "interconnect", "sovereign"],       tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 93 },
  { id: "eq-vi1",   name: "Equinix VI1",         lat: 48.2082, lng: 16.3738,   city: "Vienna",       country: "Austria", stateOrRegion: "Vienna",          countryCode: "AT",      capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 92 },
  { id: "eq-lis",   name: "Equinix LS1",         lat: 38.7223, lng: -9.1393,   city: "Lisbon",       country: "Portugal", stateOrRegion: "Lisbon",         countryCode: "PT",      capabilities: ["colocation", "cloud", "edge"],                             tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 90 },
  { id: "safehost-gen", name: "SafeHost Geneva",  lat: 46.2044, lng: 6.1432,   city: "Geneva",       country: "Switzerland", stateOrRegion: "Geneva",       countryCode: "CH",      capabilities: ["colocation", "sovereign", "compliance:soc2"],             tier: "enterprise", status: "active", provider: "SafeHost",      source: C, confidence: 88 },
  { id: "tpix-ro",  name: "TPIX Bucharest",      lat: 44.4268, lng: 26.1025,   city: "Bucharest",    country: "Romania",  stateOrRegion: "Bucharest",       countryCode: "RO",      capabilities: ["colocation", "internet-exchange"],                        tier: "enterprise", status: "active", provider: "TPIX",          source: C, confidence: 82 },
  { id: "ix-is",    name: "ISIX Reykjavik",      lat: 64.1266, lng: -21.8174,  city: "Reykjavik",    country: "Iceland",  countryCode: "IS",                capabilities: ["colocation", "internet-exchange", "edge"],                tier: "enterprise", status: "active", provider: "ISIX",          source: C, confidence: 80 },

  // ── Middle East & Africa ─────────────────────────────────────────────────
  { id: "eq-dh1",   name: "Equinix DH1",         lat: 25.2854, lng: 51.5310,   city: "Doha",         country: "Qatar",    stateOrRegion: "Ad Dawhah",      countryCode: "QA",      capabilities: ["colocation", "cloud", "sovereign"],                        tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 88 },
  { id: "eq-ri1",   name: "Equinix RI1",         lat: 24.6877, lng: 46.7219,   city: "Riyadh",       country: "Saudi Arabia", countryCode: "SA",            capabilities: ["colocation", "cloud", "sovereign"],                        tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 90 },
  { id: "eq-khi",   name: "PTCL Karachi",        lat: 24.8607, lng: 67.0011,   city: "Karachi",      country: "Pakistan",  countryCode: "PK",              capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "PTCL",          source: C, confidence: 78 },
  { id: "dc-nairobi", name: "SEACOM Nairobi",    lat: -1.2921, lng: 36.8219,   city: "Nairobi",      country: "Kenya",    stateOrRegion: "Nairobi County",  countryCode: "KE",      capabilities: ["colocation", "cloud", "edge"],                             tier: "enterprise", status: "active", provider: "SEACOM",        source: C, confidence: 83 },
  { id: "dc-lagos", name: "MainOne Lagos",       lat: 6.4555,  lng: 3.3841,    city: "Lagos",         country: "Nigeria",  stateOrRegion: "Lagos State",     countryCode: "NG",      capabilities: ["colocation", "cloud", "carrier-neutral"],                 tier: "enterprise", status: "active", provider: "MainOne",       source: C, confidence: 82, website: "https://www.mainone.net" },
  { id: "dc-acc",   name: "DataTech Ghana",      lat: 5.6037,  lng: -0.1870,   city: "Accra",         country: "Ghana",    countryCode: "GH",               capabilities: ["colocation"],                                              tier: "enterprise", status: "active", provider: "DataTech",      source: C, confidence: 72 },
  { id: "dc-cpt",   name: "Teraco CT1",          lat: -33.9249, lng: 18.4241,  city: "Cape Town",     country: "South Africa", stateOrRegion: "Western Cape", countryCode: "ZA",     capabilities: ["colocation", "cloud", "carrier-neutral"],                 tier: "enterprise", status: "active", provider: "Teraco",        source: C, confidence: 92 },
  { id: "dc-cairo", name: "Raya Telecom Cairo",  lat: 30.0444, lng: 31.2357,   city: "Cairo",         country: "Egypt",    countryCode: "EG",               capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Raya Telecom",  source: C, confidence: 78 },

  // ── Asia Pacific ──────────────────────────────────────────────────────────
  { id: "eq-hk1",   name: "Equinix HK1",         lat: 22.3193, lng: 114.1694,  city: "Hong Kong",    country: "Hong Kong",  countryCode: "HK",              capabilities: ["colocation", "cloud", "interconnect", "carrier-neutral", "direct-connect"], tier: "core", status: "active", provider: "Equinix", source: C, confidence: 98, website: "https://www.equinix.com" },
  { id: "eq-hk4",   name: "Equinix HK4",         lat: 22.3080, lng: 114.2241,  city: "Hong Kong",    country: "Hong Kong",  countryCode: "HK",              capabilities: ["colocation", "cloud", "hyperscale"],                       tier: "hyperscale", status: "active", provider: "Equinix",       source: C, confidence: 97 },
  { id: "eq-sh1",   name: "Equinix SH1",         lat: 31.2304, lng: 121.4737,  city: "Shanghai",     country: "China",   stateOrRegion: "Shanghai",         countryCode: "CN",      capabilities: ["colocation", "cloud", "sovereign"],                        tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 93 },
  { id: "chinadata-bj", name: "ChinaData Beijing", lat: 39.9042, lng: 116.4074, city: "Beijing",     country: "China",   stateOrRegion: "Beijing",          countryCode: "CN",      capabilities: ["colocation", "cloud", "hyperscale", "sovereign"],          tier: "hyperscale", status: "active", provider: "ChinaData",     source: C, confidence: 88 },
  { id: "gds-sz",   name: "GDS Shenzhen",        lat: 22.5431, lng: 114.0579,  city: "Shenzhen",     country: "China",   stateOrRegion: "Guangdong",        countryCode: "CN",      capabilities: ["colocation", "cloud", "hyperscale", "sovereign"],          tier: "hyperscale", status: "active", provider: "GDS",           source: C, confidence: 90, website: "https://www.gds-services.com" },
  { id: "sttelemedia-sg", name: "ST Telemedia SG", lat: 1.3038, lng: 103.8065, city: "Singapore", country: "Singapore", countryCode: "SG",               capabilities: ["colocation", "cloud", "interconnect"],                    tier: "core",       status: "active", provider: "ST Telemedia",  source: C, confidence: 93 },
  { id: "nextdc-m1", name: "NEXTDC M1",          lat: -37.8136, lng: 144.9631, city: "Melbourne",    country: "Australia", stateOrRegion: "Victoria",       postalCode: "3004",     countryCode: "AU", capabilities: ["colocation", "cloud", "interconnect"],             tier: "core",       status: "active", provider: "NEXTDC",        source: C, confidence: 95, website: "https://www.nextdc.com" },
  { id: "nextdc-s2", name: "NEXTDC S2",          lat: -33.8688, lng: 151.1957, city: "Sydney",       country: "Australia", stateOrRegion: "NSW",            postalCode: "2119",     countryCode: "AU", capabilities: ["colocation", "cloud", "hyperscale"],                tier: "hyperscale", status: "active", provider: "NEXTDC",        source: C, confidence: 95 },
  { id: "eq-pe1",   name: "Equinix PE1",         lat: -31.9505, lng: 115.8605, city: "Perth",        country: "Australia", stateOrRegion: "WA",             countryCode: "AU",      capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 91 },
  { id: "ntt-sin",  name: "NTT Singapore 1",     lat: 1.3521,  lng: 103.7483,  city: "Singapore",    country: "Singapore", countryCode: "SG",               capabilities: ["colocation", "cloud", "hyperscale", "direct-connect"],     tier: "hyperscale", status: "active", provider: "NTT",           source: C, confidence: 95, website: "https://www.ntt.com" },
  { id: "eq-mk1",   name: "Equinix KL1",         lat: 3.1390,  lng: 101.6869,  city: "Kuala Lumpur", country: "Malaysia",  stateOrRegion: "KL",              countryCode: "MY",      capabilities: ["colocation", "cloud", "edge"],                             tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 91 },
  { id: "eq-bk1",   name: "Equinix BK1",         lat: 13.7563, lng: 100.5018,  city: "Bangkok",      country: "Thailand",  countryCode: "TH",               capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 89 },
  { id: "equinix-jk1", name: "Equinix JK1",      lat: -6.2088, lng: 106.8456,  city: "Jakarta",      country: "Indonesia", countryCode: "ID",               capabilities: ["colocation", "cloud", "interconnect"],                    tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 92 },
  { id: "eq-mn1",   name: "Equinix MN1",         lat: 14.5995, lng: 120.9842,  city: "Manila",       country: "Philippines", countryCode: "PH",             capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Equinix",       source: C, confidence: 88 },
  { id: "ntt-seo",  name: "NTT Seoul",           lat: 37.5665, lng: 126.9780,  city: "Seoul",        country: "South Korea", stateOrRegion: "Seoul",         countryCode: "KR",      capabilities: ["colocation", "cloud", "interconnect"],                    tier: "core",       status: "active", provider: "NTT",           source: C, confidence: 93 },
  { id: "idc-taipei", name: "Chunghwa Telecom IDC", lat: 25.0330, lng: 121.5654, city: "Taipei",   country: "Taiwan",    stateOrRegion: "Taipei City",      countryCode: "TW",      capabilities: ["colocation", "cloud", "interconnect", "sovereign"],       tier: "core",       status: "active", provider: "Chunghwa Telecom", source: C, confidence: 90 },
  { id: "cbre-hyd", name: "CBRE Hyderabad",      lat: 17.3850, lng: 78.4867,   city: "Hyderabad",    country: "India",   stateOrRegion: "Telangana",        countryCode: "IN",      capabilities: ["colocation", "cloud", "gpu"],                              tier: "enterprise", status: "active", provider: "CBRE",          source: C, confidence: 80 },
  { id: "nxtgen-del", name: "NxtGen Delhi NCR",  lat: 28.6139, lng: 77.2090,   city: "Delhi",        country: "India",   stateOrRegion: "Delhi",            countryCode: "IN",      capabilities: ["colocation", "cloud", "edge"],                             tier: "enterprise", status: "active", provider: "NxtGen",        source: C, confidence: 82 },
  { id: "eq-mu-in", name: "Equinix Mumbai",      lat: 19.0760, lng: 72.8777,   city: "Mumbai",       country: "India",   stateOrRegion: "Maharashtra",      countryCode: "IN",      capabilities: ["colocation", "cloud", "interconnect"],                    tier: "core",       status: "active", provider: "Equinix",       source: C, confidence: 95 },
  { id: "nz-auckland", name: "Vocus Auckland",   lat: -36.8485, lng: 174.7633, city: "Auckland",     country: "New Zealand", stateOrRegion: "Auckland",      countryCode: "NZ",      capabilities: ["colocation", "cloud"],                                     tier: "enterprise", status: "active", provider: "Vocus",         source: C, confidence: 88 },
] as const;
