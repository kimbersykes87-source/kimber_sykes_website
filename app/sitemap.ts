import type { MetadataRoute } from "next";
import { projects } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/work",
    "/clients",
    "/where",
    "/about",
    "/contact",
    "/llms.txt",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : path === "/llms.txt" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/llms.txt" ? 0.9 : 0.8,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
