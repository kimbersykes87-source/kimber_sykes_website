import type { CSSProperties } from "react";
import type { LogoEntry } from "@/lib/types";

/** Satisfies Next.js `Image` when sizing via CSS `max-*` + `object-contain`. */
const LOGO_IMG_STYLE: CSSProperties = { width: "auto", height: "auto" };

function logoScale(entry: LogoEntry): number {
  const s = entry.displayScale;
  return typeof s === "number" && s > 0 ? s : 1;
}

/** Clients page “Brands” grid: base h-10 / max-w 140px, width×height for Next/Image. */
export function clientsPageLogoDisplay(entry: LogoEntry) {
  const s = logoScale(entry);
  if (s === 1) {
    return {
      width: 160,
      height: 48,
      className: "logo-on-dark h-auto w-auto max-h-10 max-w-[140px] object-contain",
      style: LOGO_IMG_STYLE,
    };
  }
  return {
    width: Math.round(160 * s),
    height: Math.round(48 * s),
    className: "logo-on-dark h-auto w-auto max-h-[3.75rem] max-w-[210px] object-contain",
    style: LOGO_IMG_STYLE,
  };
}

/** Home marquee: base h-8 / max 7.5rem, sm:h-10. */
export function marqueeLogoDisplay(entry: LogoEntry) {
  const s = logoScale(entry);
  if (s === 1) {
    return {
      width: 120,
      height: 40,
      className: "logo-on-dark h-auto w-auto max-h-8 max-w-[7.5rem] object-contain sm:max-h-10",
      style: LOGO_IMG_STYLE,
    };
  }
  return {
    width: Math.round(120 * s),
    height: Math.round(40 * s),
    className: "logo-on-dark h-auto w-auto max-h-12 max-w-[11.25rem] object-contain sm:max-h-[3.75rem]",
    style: LOGO_IMG_STYLE,
  };
}
