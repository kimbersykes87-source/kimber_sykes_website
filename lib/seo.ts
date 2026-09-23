import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

/** Default social preview — professional portrait (also used when a page has no bespoke image). */
export const DEFAULT_OG_IMAGE = "/images/about/portrait.jpg";

export const HOME_TITLE =
  "Kimber Sykes — Freelance Executive Producer | Corporate & Experiential Events";

export const HOME_DESCRIPTION =
  "Freelance Executive Producer, Production Manager, and Technical Director in London. 23 years delivering corporate summits, conferences, and experiential brand activations worldwide.";

export function absoluteUrl(path: string): string {
  const site = getSiteUrl();
  if (!path || path === "/") return `${site}/`;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  ogImage?: string;
}): Metadata {
  const canonical = absoluteUrl(opts.path);
  const image = absoluteUrl(opts.ogImage ?? DEFAULT_OG_IMAGE);

  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      type: opts.ogType ?? "website",
      images: [{ url: image, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
