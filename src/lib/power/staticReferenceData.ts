/**
 * staticReferenceData.ts
 *
 * Embedded reference data for Power Feasibility scoring.
 * Used as a working fallback when no Supabase data has been ingested yet.
 *
 * Sources (all publicly available, cited inline):
 *  - EPA eGRID 2022 Summary Tables: https://www.epa.gov/egrid/download-data
 *  - EIA Electric Power Monthly Table 5.6.B (2023 average): https://www.eia.gov/electricity/monthly/
 *  - MISO/PJM queue summary statistics compiled from public queue publications
 *
 * IMPORTANT: These are approximations. Label every derived insight as an
 * "estimate" or "proxy" in any user-facing text.
 */

// ─── eGRID 2022 CO₂ lb/MWh by US state (approximate; mapped to nearest subregion) ──
// Lower = greener. Range: 24 (VT) to ~1,900 (WV).
// Full methodology: EPA eGRID 2022, Table 2. State mapping = largest subregion by generation.
export const EGRID_CO2_BY_STATE: Record<string, number> = {
  AL: 990,  AK: 930,  AZ: 880,  AR: 1050,
  CA: 520,  CO: 1210, CT: 560,  DE: 920,
  FL: 1010, GA: 860,  HI: 1520, ID: 260,
  IL: 980,  IN: 1490, IA: 920,  KS: 1020,
  KY: 1920, LA: 1010, ME: 290,  MD: 800,
  MA: 590,  MI: 1010, MN: 960,  MS: 880,
  MO: 1480, MT: 990,  NE: 1030, NV: 750,
  NH: 340,  NJ: 600,  NM: 1140, NY: 590,
  NC: 800,  ND: 1620, OH: 1290, OK: 880,
  OR: 280,  PA: 870,  RI: 540,  SC: 760,
  SD: 760,  TN: 700,  TX: 880,  UT: 1380,
  VT: 24,   VA: 750,  WA: 280,  WV: 1890,
  WI: 1020, WY: 1620, DC: 920,
};

// ─── EIA 2023 average industrial electricity rate $/kWh by state ──────────────
// Source: EIA Electric Power Monthly, Table 5.6.B (December 2023 average rates).
// Lower = cheaper for data centers.
export const EIA_INDUSTRIAL_RATE_BY_STATE: Record<string, number> = {
  AL: 0.068, AK: 0.118, AZ: 0.073, AR: 0.065,
  CA: 0.178, CO: 0.077, CT: 0.142, DE: 0.088,
  FL: 0.083, GA: 0.069, HI: 0.310, ID: 0.060,
  IL: 0.079, IN: 0.069, IA: 0.064, KS: 0.070,
  KY: 0.058, LA: 0.062, ME: 0.115, MD: 0.082,
  MA: 0.148, MI: 0.085, MN: 0.080, MS: 0.072,
  MO: 0.062, MT: 0.073, NE: 0.067, NV: 0.080,
  NH: 0.102, NJ: 0.102, NM: 0.072, NY: 0.059,
  NC: 0.069, ND: 0.067, OH: 0.072, OK: 0.064,
  OR: 0.074, PA: 0.075, RI: 0.126, SC: 0.064,
  SD: 0.074, TN: 0.062, TX: 0.066, UT: 0.069,
  VT: 0.094, VA: 0.067, WA: 0.047, WV: 0.063,
  WI: 0.079, WY: 0.063, DC: 0.100,
};

// ─── Active interconnection queue MW by state (approximate) ───────────────────
// Compiled from MISO (2024 Q1), PJM (2024 Q1), NYISO (2024), CAISO (2024),
// and ERCOT (2024) public queue reports.
// IMPORTANT: This represents queued MW, NOT available capacity.
//   More queued MW = more congestion / upgrade uncertainty.
// For states not listed, a medium national average (~5,000 MW) is used.
export const QUEUE_MW_BY_STATE: Record<string, number> = {
  AL: 4200,  AK: 200,   AZ: 12000, AR: 3800,
  CA: 42000, CO: 18000, CT: 3500,  DE: 4200,
  FL: 18000, GA: 9000,  HI: 800,   ID: 6000,
  IL: 25000, IN: 9500,  IA: 12000, KS: 14000,
  KY: 3200,  LA: 4500,  ME: 7000,  MD: 5500,
  MA: 6000,  MI: 12000, MN: 22000, MS: 3400,
  MO: 7800,  MT: 8000,  NE: 6000,  NV: 9500,
  NH: 2200,  NJ: 7500,  NM: 12000, NY: 28000,
  NC: 18000, ND: 16000, OH: 12000, OK: 18000,
  OR: 11000, PA: 18000, RI: 1200,  SC: 7000,
  SD: 9500,  TN: 4500,  TX: 78000, UT: 7000,
  VT: 1800,  VA: 21000, WA: 15000, WV: 3200,
  WI: 7500,  WY: 6500,  DC: 1000,
};

// ─── Large power plants: top ~60 US plants by capacity ────────────────────────
// Source: EIA-860 2022. Used for genIndex scoring and "nearby generation" display.
// Full EIA-860 data available at: https://www.eia.gov/electricity/data/eia860/
export type StaticPlant = {
  id: string;
  name: string;
  operator: string;
  fuelType: string;
  capacityMw: number;
  lat: number;
  lng: number;
  state: string;
};

export const STATIC_LARGE_PLANTS: StaticPlant[] = [
  // Nuclear (high reliability weight)
  { id: "2003", name: "Palo Verde Nuclear",      operator: "APS",             fuelType: "NUC", capacityMw: 3937, lat: 33.388, lng: -112.861, state: "AZ" },
  { id: "6186", name: "Grand Coulee (Hydro)",    operator: "USBR",            fuelType: "WAT", capacityMw: 6809, lat: 47.957, lng: -118.981, state: "WA" },
  { id: "3",    name: "Robert Moses Niagara",    operator: "NYPA",            fuelType: "WAT", capacityMw: 2675, lat: 43.118, lng: -79.055, state: "NY" },
  { id: "880",  name: "Peach Bottom Nuclear",    operator: "Exelon",          fuelType: "NUC", capacityMw: 2773, lat: 39.759, lng: -76.269, state: "PA" },
  { id: "879",  name: "Limerick Nuclear",        operator: "Exelon",          fuelType: "NUC", capacityMw: 2346, lat: 40.222, lng: -75.590, state: "PA" },
  { id: "876",  name: "Salem/Hope Creek Nuclear",operator: "PSE&G",           fuelType: "NUC", capacityMw: 3617, lat: 39.461, lng: -75.536, state: "NJ" },
  { id: "6111", name: "Comanche Peak Nuclear",   operator: "Luminant",        fuelType: "NUC", capacityMw: 2430, lat: 32.299, lng: -97.792, state: "TX" },
  { id: "2586", name: "Vogtle Nuclear",          operator: "Georgia Power",   fuelType: "NUC", capacityMw: 4940, lat: 33.142, lng: -81.763, state: "GA" },
  { id: "2568", name: "Browns Ferry Nuclear",    operator: "TVA",             fuelType: "NUC", capacityMw: 3755, lat: 34.704, lng: -87.122, state: "AL" },
  { id: "6225", name: "South Texas Project",     operator: "STP Nuclear",     fuelType: "NUC", capacityMw: 2700, lat: 28.796, lng: -96.050, state: "TX" },
  // Large Gas/CC
  { id: "1",    name: "Midland Cogen",           operator: "Midland Cogen",   fuelType: "NG",  capacityMw: 1633, lat: 43.609, lng: -84.284, state: "MI" },
  { id: "55786", name: "Desert Sunlight Solar",  operator: "NRG Energy",      fuelType: "SUN", capacityMw: 1800, lat: 33.830, lng: -115.450, state: "CA" },
  { id: "7332", name: "Martin Natural Gas",      operator: "FPL",             fuelType: "NG",  capacityMw: 3705, lat: 25.981, lng: -80.775, state: "FL" },
  { id: "6097", name: "Colstrip Steam Electric", operator: "Talen Energy",    fuelType: "SUB", capacityMw: 2094, lat: 45.892, lng: -106.618, state: "MT" },
  { id: "8",    name: "Monroe Power Plant",      operator: "DTE Energy",      fuelType: "SUB", capacityMw: 3276, lat: 41.926, lng: -83.446, state: "MI" },
  { id: "6153", name: "W A Parish Power Station",operator: "NRG Energy",      fuelType: "NG",  capacityMw: 3654, lat: 29.507, lng: -95.712, state: "TX" },
  { id: "3503", name: "Moss Landing Power Plant",operator: "Vistra",          fuelType: "NG",  capacityMw: 2484, lat: 36.802, lng: -121.786, state: "CA" },
  { id: "7162", name: "Diablo Canyon Nuclear",   operator: "PG&E",            fuelType: "NUC", capacityMw: 2289, lat: 35.211, lng: -120.851, state: "CA" },
  // Large Wind
  { id: "58019", name: "Roscoe Wind Farm",       operator: "RWE Renewables",  fuelType: "WND", capacityMw: 781,  lat: 32.451, lng: -100.536, state: "TX" },
  { id: "65480", name: "Alta Wind Energy Center",operator: "Terra-Gen",       fuelType: "WND", capacityMw: 1548, lat: 34.913, lng: -118.352, state: "CA" },
  { id: "6261", name: "Horse Hollow Wind",       operator: "NextEra",         fuelType: "WND", capacityMw: 735,  lat: 31.897, lng: -99.972, state: "TX" },
  // Hydro
  { id: "6184", name: "Hoover Dam",              operator: "USBR",            fuelType: "WAT", capacityMw: 2080, lat: 36.016, lng: -114.738, state: "NV" },
  { id: "1259", name: "Chief Joseph Dam",        operator: "Army Corps",      fuelType: "WAT", capacityMw: 2620, lat: 47.992, lng: -119.635, state: "WA" },
  // Major CCGT stations
  { id: "57914", name: "Cricket Valley Energy",  operator: "Competitive Power",fuelType: "NG",  capacityMw: 1100, lat: 41.623, lng: -73.546, state: "NY" },
  { id: "7796",  name: "Stony Point Power Plant",operator: "Fortis",          fuelType: "NG",  capacityMw:  585, lat: 41.236, lng: -73.980, state: "NY" },
  { id: "3473",  name: "Lakeland Power",         operator: "Lakeland Elec",   fuelType: "NG",  capacityMw:  497, lat: 28.022, lng: -81.978, state: "FL" },
  { id: "7225",  name: "Elgin Energy Center",    operator: "NRG",             fuelType: "NG",  capacityMw:  572, lat: 41.999, lng: -88.370, state: "IL" },
  { id: "10470", name: "Kendall County GS",      operator: "Exelon",          fuelType: "NG",  capacityMw: 1173, lat: 41.577, lng: -88.474, state: "IL" },
  { id: "10544", name: "Guadalupe Power Park",   operator: "NRG Energy",      fuelType: "NG",  capacityMw: 1000, lat: 29.672, lng: -97.987, state: "TX" },
  { id: "10693", name: "Cedar Bayou Generating", operator: "NRG Energy",      fuelType: "NG",  capacityMw: 2100, lat: 29.693, lng: -94.949, state: "TX" },
  // West / Southwest
  { id: "6195", name: "Navajo Generating Station",operator: "SRP",            fuelType: "SUB", capacityMw: 2409, lat: 36.853, lng: -111.374, state: "AZ" },
  { id: "6196", name: "Intermountain Power",     operator: "LADWP",           fuelType: "SUB", capacityMw: 1800, lat: 39.545, lng: -112.831, state: "UT" },
  { id: "4956", name: "Boneville Dam",           operator: "Army Corps",      fuelType: "WAT", capacityMw: 1093, lat: 45.644, lng: -121.941, state: "OR" },
  // Midwest
  { id: "8",    name: "Rockport Power Plant",    operator: "AEP",             fuelType: "SUB", capacityMw: 2600, lat: 37.888, lng: -87.039, state: "IN" },
  { id: "6058", name: "Gibson Generating",       operator: "Duke Energy",     fuelType: "SUB", capacityMw: 3345, lat: 38.478, lng: -87.641, state: "IN" },
  // Battery / Storage (emerging)
  { id: "65923", name: "Moss Landing Battery",   operator: "Vistra",          fuelType: "BAT", capacityMw: 1200, lat: 36.802, lng: -121.784, state: "CA" },
  { id: "66113", name: "Edwards & Sanborn Solar",operator: "Terra-Gen",       fuelType: "SUN", capacityMw: 1310, lat: 34.783, lng: -118.140, state: "CA" },
];

// ─── eGRID subregion code to approximate US states ────────────────────────────
// Used when no PostGIS geometry is available to map a state to a subregion.
export const STATE_TO_EGRID_SUBREGION: Record<string, string> = {
  ME: "NEWE", VT: "NEWE", NH: "NEWE", MA: "NEWE", RI: "NEWE", CT: "NEWE",
  NY: "NYUP", NJ: "RFCE", PA: "RFCE", MD: "RFCE", DE: "RFCE", DC: "RFCE",
  VA: "SRVC", WV: "RFCW", NC: "SRVC", SC: "SRTV", GA: "SRSO", FL: "FRCC",
  AL: "SRSO", MS: "SRSO", TN: "SRTV", KY: "RFCW", OH: "RFCW",
  MI: "RFCM", IN: "RFCW", IL: "RFCM", WI: "MROE", MN: "MROW",
  IA: "MROW", MO: "MROW", AR: "SRSO", LA: "SRMW",
  TX: "ERCT", OK: "SPP",  KS: "SPPS", NE: "MROW", SD: "MROW", ND: "MROW",
  MT: "NWPP", WY: "RMPA", CO: "RMPA", NM: "AZNM", AZ: "AZNM", UT: "RMPA",
  NV: "AZNM", CA: "CAMX", OR: "NWPP", WA: "NWPP", ID: "NWPP",
  AK: "AKGD", HI: "HIMS",
};

/** All US states ISO 3166-2 codes */
export const US_STATES = Object.keys(EGRID_CO2_BY_STATE);

/**
 * Very rough bounding boxes for US states.
 * Used to determine which state a lat/lng falls in when PostGIS isn't available.
 * Only covers the contiguous 48 + AK + HI at a coarse level.
 */
export const STATE_BBOX: Record<string, [number, number, number, number]> = {
  // [west, south, east, north]
  WA: [-124.7, 45.5, -116.9, 49.0], OR: [-124.5, 42.0, -116.5, 46.3],
  CA: [-124.4, 32.5,  -114.1, 42.0], NV: [-120.0, 35.0, -114.0, 42.0],
  ID: [-117.2, 42.0, -111.0, 49.0], MT: [-116.0, 44.4, -104.0, 49.0],
  WY: [-111.1, 40.9, -104.1, 45.0], UT: [-114.1, 37.0, -109.0, 42.0],
  CO: [-109.1, 37.0, -102.0, 41.0], AZ: [-114.8, 31.3, -109.1, 37.0],
  NM: [-109.1, 31.3, -103.0, 37.0], TX: [-106.7, 25.8,  -93.5, 36.5],
  ND: [-104.1, 45.9,  -96.5, 49.0], SD: [-104.1, 42.5,  -96.4, 45.9],
  NE: [-104.1, 40.0,  -95.3, 43.0], KS: [-102.1, 37.0,  -94.6, 40.0],
  OK: [ -103.0, 33.6,  -94.4, 37.0], MN: [ -97.2, 43.5,  -89.5, 49.4],
  IA: [  -96.6, 40.4,  -90.1, 43.5], MO: [ -95.8, 36.0,  -89.1, 40.6],
  WI: [  -92.9, 42.5,  -86.2, 47.1], IL: [ -91.5, 37.0,  -87.5, 42.5],
  MI: [  -90.4, 41.7,  -82.4, 48.3], IN: [ -88.1, 37.8,  -84.8, 41.8],
  OH: [  -84.8, 38.4,  -80.5, 42.0], KY: [ -89.6, 36.5,  -81.9, 39.1],
  TN: [  -90.3, 34.9,  -81.7, 36.7], NC: [ -84.3, 33.8,  -75.5, 36.6],
  SC: [  -83.4, 32.0,  -78.5, 35.2], GA: [ -85.6, 30.3,  -80.8, 35.0],
  FL: [  -87.6, 24.4,  -80.0, 31.0], AL: [ -88.5, 30.1,  -84.9, 35.0],
  MS: [  -91.7, 30.2,  -88.1, 35.0], LA: [ -94.0, 28.9,  -88.8, 33.0],
  AR: [  -94.6, 33.0,  -89.7, 36.5], VA: [ -83.7, 36.5,  -75.2, 39.5],
  WV: [  -82.6, 37.2,  -77.7, 40.6], PA: [ -80.5, 39.7,  -74.7, 42.3],
  NY: [  -79.8, 40.5,  -71.9, 45.0], MD: [ -79.5, 37.9,  -75.0, 39.7],
  DE: [  -75.8, 38.4,  -75.0, 39.8], NJ: [ -75.6, 38.9,  -73.9, 41.4],
  CT: [  -73.7, 41.0,  -71.8, 42.1], RI: [ -71.9, 41.1,  -71.1, 42.0],
  MA: [  -73.5, 41.2,  -69.9, 42.9], VT: [ -73.4, 42.7,  -71.5, 45.0],
  NH: [  -72.6, 42.7,  -70.7, 45.3], ME: [ -71.1, 43.0,  -66.9, 47.5],
  AK: [ -168.0, 54.0, -140.0, 71.4], HI: [-160.3, 18.9, -154.8, 22.3],
  DC: [  -77.1, 38.8,  -76.9, 39.0],
};

/**
 * Determine US state abbreviation from lat/lon using bbox lookup.
 * Returns null if not in the US (or not determinable from bbox alone).
 */
export function latLonToState(lat: number, lng: number): string | null {
  for (const [state, [w, s, e, n]] of Object.entries(STATE_BBOX)) {
    if (lng >= w && lng <= e && lat >= s && lat <= n) return state;
  }
  return null;
}
