import type { MetadataRoute } from "next";
import { AI_CRAWLER_USER_AGENTS } from "@/lib/ai-crawlers";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({ userAgent, allow: "/" as const })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ""),
  };
}
