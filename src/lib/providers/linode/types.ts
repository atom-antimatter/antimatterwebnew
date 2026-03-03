/**
 * Zod schemas + TypeScript types for Akamai/Linode API responses.
 * Validated strictly so ingestion never silently corrupts data.
 */
import { z } from "zod";

// ─── /v4/regions response ────────────────────────────────────────────────────

export const LinodeRegionSchema = z.object({
  id:           z.string(),
  country:      z.string().optional(),
  label:        z.string().optional(),
  capabilities: z.array(z.string()).default([]),
  status:       z.enum(["ok", "outage"]).optional(),
  resolvers: z.object({
    ipv4: z.string().optional(),
    ipv6: z.string().optional(),
  }).optional(),
  placement_group_limits: z.object({
    maximum_pgs_per_customer: z.number().optional(),
    maximum_linodes_per_pg: z.number().optional(),
  }).optional(),
  site_type: z.enum(["core", "distributed"]).optional(),
}).passthrough(); // allow extra fields for forward compatibility

export type LinodeRegion = z.infer<typeof LinodeRegionSchema>;

export const LinodeRegionsResponseSchema = z.object({
  data:    z.array(LinodeRegionSchema),
  page:    z.number().optional(),
  pages:   z.number().optional(),
  results: z.number().optional(),
});

// ─── /v4/regions/availability response ──────────────────────────────────────

export const LinodeAvailabilitySchema = z.object({
  region:    z.string(),
  available: z.boolean().optional(),
}).passthrough();

export type LinodeAvailability = z.infer<typeof LinodeAvailabilitySchema>;

export const LinodeAvailabilityResponseSchema = z.object({
  data:    z.array(LinodeAvailabilitySchema),
  page:    z.number().optional(),
  pages:   z.number().optional(),
  results: z.number().optional(),
});

// ─── Normalised provider region (for DB + client) ────────────────────────────

export type ProviderRegion = {
  provider:      string;        // 'akamai_linode'
  region_id:     string;        // Linode region slug, e.g. 'us-east'
  label:         string;
  country:       string | null;
  city:          string | null;
  metro:         string | null;
  site_type:     string | null;
  lat:           number | null;
  lng:           number | null;
  capabilities:  string[];
  availability:  Record<string, unknown> | null;
  status:        string | null;
  source:        {
    api:         string;
    fetchedAt:   string;
  };
};
