import type { Metadata } from "next";
import { IDENTITY } from "@/lib/identity";
import { publicImageSize } from "@/lib/imageSize";
import { getSiteUrl } from "@/lib/site";

/** Default social preview: professional portrait (used when a page has no bespoke image). */
export const DEFAULT_OG_IMAGE = IDENTITY.portrait.src;

export const DEFAULT_OG_IMAGE_ALT = `${IDENTITY.name}, freelance ${IDENTITY.rolesLine}`;

export const SITE_NAME = IDENTITY.name;

export const HOME_TITLE = `${IDENTITY.name} | Freelance ${IDENTITY.roles.join(", ")}`;

export const HOME_DESCRIPTION = IDENTITY.metaDescription;

/** Static pages: "{Topic} | Kimber Sykes". */
export function pageTitle(topic: string): string {
  return `${topic} | ${SITE_NAME}`;
}

export function absoluteUrl(path: string): string {
  const site = getSiteUrl();
  if (!path || path === "/") return site;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  ogImageAlt?: string;
}): Metadata {
  const canonical = absoluteUrl(opts.path);
  const imagePath = opts.ogImage ?? DEFAULT_OG_IMAGE;
  const image = absoluteUrl(imagePath);
  const size = publicImageSize(imagePath);
  const alt = opts.ogImageAlt ?? (opts.ogImage ? opts.title : DEFAULT_OG_IMAGE_ALT);

  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: {
      canonical,
      // Page-level alternates replace the layout's, so the llms.txt links are repeated here.
      types: {
        "text/plain": [
          { url: "/llms.txt", title: "LLM site summary" },
          { url: "/llms-full.txt", title: "LLM full text" },
        ],
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: opts.ogType ?? "website",
      images: [{ url: image, alt, ...(size ?? {}) }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
