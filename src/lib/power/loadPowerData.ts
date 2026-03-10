/**
 * loadPowerData.ts — Reads power market data from local JSON files.
 * Used by API routes for zero-config development. In production,
 * these can be replaced with Supabase queries.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import type { StateRecord, FacilityRecord } from "./powerRanking";

let _states: StateRecord[] | null = null;
let _facilities: FacilityRecord[] | null = null;

function dataPath(file: string) {
  return resolve(process.cwd(), "data/power", file);
}

export function loadStates(): StateRecord[] {
  if (_states) return _states;
  try {
    const raw = JSON.parse(readFileSync(dataPath("complete.json"), "utf-8"));
    _states = raw.states as StateRecord[];
    return _states;
  } catch (e) {
    console.error("[loadPowerData] Failed to load states:", e);
    return [];
  }
}

export function loadFacilities(): FacilityRecord[] {
  if (_facilities) return _facilities;
  try {
    const raw = JSON.parse(readFileSync(dataPath("complete.json"), "utf-8"));
    _facilities = raw.facilities as FacilityRecord[];
    return _facilities;
  } catch (e) {
    console.error("[loadPowerData] Failed to load facilities:", e);
    return [];
  }
}

export function loadApiReady() {
  try {
    return JSON.parse(readFileSync(dataPath("api_ready.json"), "utf-8"));
  } catch {
    return null;
  }
}
