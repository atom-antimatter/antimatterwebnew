"use client";

import { useRef, useCallback, useState } from "react";
import DataCenterGlobe, { type DataCenterGlobeRef } from "@/components/dataCenterGlobe/Globe";
import SearchBar from "@/components/dataCenterGlobe/SearchBar";
import { DATA_CENTERS, type DataCenter } from "@/data/dataCenters";

function filterDataCenters(query: string): DataCenter[] {
  if (!query) return [];
  const q = query.toLowerCase();
  return DATA_CENTERS.filter(
    (dc) =>
      dc.name.toLowerCase().includes(q) ||
      dc.city.toLowerCase().includes(q) ||
      dc.country.toLowerCase().includes(q)
  );
}

export default function DataCenterMapClient() {
  const globeRef = useRef<DataCenterGlobeRef | null>(null);
  const [results, setResults] = useState<DataCenter[] | null>(null);

  const handleSearch = useCallback((query: string) => {
    const matches = filterDataCenters(query);
    setResults(matches.length > 0 ? matches : []);

    if (matches.length === 1) {
      const dc = matches[0];
      globeRef.current?.pointOfView(
        { lat: dc.lat, lng: dc.lng, altitude: 1.6 },
        900
      );
    } else if (matches.length > 1) {
      // Fly to first match; user can pick from list to fly to another
      const dc = matches[0];
      globeRef.current?.pointOfView(
        { lat: dc.lat, lng: dc.lng, altitude: 1.8 },
        900
      );
    }
  }, []);

  const flyTo = useCallback((dc: DataCenter) => {
    globeRef.current?.pointOfView(
      { lat: dc.lat, lng: dc.lng, altitude: 1.6 },
      900
    );
    setResults(null);
  }, []);

  return (
    <main className="w-full min-h-screen bg-[#020202] pt-24 md:pt-28">
      <div className="relative w-full min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-7rem)]">
        <SearchBar onSearch={handleSearch} />
        {results && results.length > 0 && (
          <div
            className="absolute top-20 left-6 z-10 max-w-sm w-full rounded-xl border border-[rgba(246,246,253,0.1)] bg-[rgba(2,2,2,0.9)] shadow-lg overflow-hidden"
            role="region"
            aria-label="Search results"
          >
            <ul className="py-2 max-h-48 overflow-y-auto list-none p-0 m-0">
              {results.map((dc) => (
                <li key={`${dc.name}-${dc.lat}-${dc.lng}`}>
                  <button
                    type="button"
                    onClick={() => flyTo(dc)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#f6f6fd] hover:bg-[rgba(105,106,172,0.2)] focus:outline-none focus:bg-[rgba(105,106,172,0.2)] transition-colors"
                  >
                    <span className="font-medium">{dc.name}</span>
                    <span className="text-[rgba(246,246,253,0.65)] ml-1">
                      — {dc.city}, {dc.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {results && results.length === 0 && (
          <div
            className="absolute top-20 left-6 z-10 max-w-sm w-full rounded-xl border border-[rgba(246,246,253,0.1)] bg-[rgba(2,2,2,0.9)] px-4 py-3 text-sm text-[rgba(246,246,253,0.65)]"
            role="status"
          >
            No data centers found.
          </div>
        )}
        <DataCenterGlobe active={true} globeRef={globeRef} />
      </div>
    </main>
  );
}
