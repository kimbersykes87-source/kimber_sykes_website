import type { MetadataRoute } from "next";
import { projects } from "@/lib/data";
import { gitLastModified, newest } from "@/lib/lastmod";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Page route -> source files whose last commit is that page's honest lastmod. */
const STATIC_ROUTES: { path: string; sources: string[]; priority: number }[] = [
  { path: "", sources: ["app/page.tsx", "data/featured.json", "data/site.json"], priority: 1 },
  { path: "/about", sources: ["app/about/page.tsx", "data/site.json"], priority: 0.9 },
  { path: "/work", sources: ["app/work/page.tsx", "data/projects.json"], priority: 0.9 },
  { path: "/clients", sources: ["app/clients/page.tsx", "data/clients.json", "data/agencies.json"], priority: 0.6 },
  { path: "/where", sources: ["app/where/page.tsx", "data/delivery-locations.json", "data/map.json"], priority: 0.6 },
  { path: "/contact", sources: ["app/contact/page.tsx", "data/site.json"], priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, sources, priority }) => ({
    url: `${base}${path}`,
    lastModified: gitLastModified(...sources),
    priority,
  }));

  const projectsLastMod = gitLastModified("data/projects.json", "app/work/[slug]/page.tsx");
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: newest(projectsLastMod, p.updated),
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
