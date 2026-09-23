import type { DeliveryLocation, LogoEntry, MapCountry, Project } from "@/lib/types";
import agenciesData from "@/data/agencies.json";
import clientsData from "@/data/clients.json";
import deliveryLocationsData from "@/data/delivery-locations.json";
import featuredData from "@/data/featured.json";
import mapData from "@/data/map.json";
import projectsData from "@/data/projects.json";

export const projects: Project[] = projectsData as Project[];

export const clients: LogoEntry[] = clientsData as LogoEntry[];

export const agencies: LogoEntry[] = agenciesData as LogoEntry[];

export const featuredSlugs: string[] = featuredData as string[];

export const mapCountries: MapCountry[] = mapData as MapCountry[];

export const deliveryLocations: DeliveryLocation[] = deliveryLocationsData as DeliveryLocation[];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectIndex(slug: string): number {
  return projects.findIndex((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  prev?: Project;
  next?: Project;
} {
  const i = getProjectIndex(slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? projects[i - 1] : undefined,
    next: i < projects.length - 1 ? projects[i + 1] : undefined,
  };
}

export function getFeaturedProjects(): Project[] {
  return featuredSlugs
    .map((s) => getProjectBySlug(s))
    .filter((p): p is Project => Boolean(p));
}

/** Map TopoJSON uses ISO 3166-1 alpha-3 in geography properties. */
export function mapHighlightAlpha3(countryCode: string): string | null {
  const alpha2To3: Record<string, string> = {
    AU: "AUS",
    BR: "BRA",
    CN: "CHN",
    FR: "FRA",
    DE: "DEU",
    ID: "IDN",
    IT: "ITA",
    MY: "MYS",
    NL: "NLD",
    NZ: "NZL",
    NG: "NGA",
    QA: "QAT",
    ZA: "ZAF",
    AE: "ARE",
    GB: "GBR",
    US: "USA",
  };
  return alpha2To3[countryCode.toUpperCase()] ?? null;
}

export function getHighlightedAlpha3Set(): Set<string> {
  const set = new Set<string>();
  for (const row of mapCountries) {
    const a3 = mapHighlightAlpha3(row.countryCode);
    if (a3) set.add(a3);
  }
  return set;
}
