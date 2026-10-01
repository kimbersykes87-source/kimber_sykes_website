import siteData from "@/data/site.json";

/**
 * Single source of truth for who Kimber is. Also read by scripts/lib/schema-graph.mjs
 * and scripts/generate-llms-txt.mjs, so edit data/site.json rather than hard-coding copy.
 */
export const IDENTITY = siteData;

export type SectorKey = keyof typeof siteData.sectors;
