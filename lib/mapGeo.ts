import { mapCountries } from "@/lib/data";
import type { MapCountry } from "@/lib/types";

/** world-atlas / Natural Earth geography name → panel rows from map.json */
export function resolveCountriesForAtlasName(atlasName: string): MapCountry[] {
  if (atlasName === "United States of America") {
    return mapCountries.filter((c) => c.country === "United States");
  }
  return mapCountries.filter((c) => c.country === atlasName);
}

export function atlasNameIsHighlighted(atlasName: string): boolean {
  return resolveCountriesForAtlasName(atlasName).length > 0;
}
