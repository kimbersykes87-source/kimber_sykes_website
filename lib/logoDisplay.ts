import type { CSSProperties } from "react";
import type { LogoEntry } from "@/lib/types";
import { logoAspect } from "@/lib/logoAspect";

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

/** Home marquee: base h-12 / max 11.25rem, sm:h-[3.75rem]. */
export function marqueeLogoDisplay(entry: LogoEntry) {
  const s = logoScale(entry);
  if (s === 1) {
    return {
      width: 180,
      height: 60,
      className: "logo-on-dark h-auto w-auto max-h-12 max-w-[11.25rem] object-contain sm:max-h-[3.75rem]",
      style: LOGO_IMG_STYLE,
    };
  }
  return {
    width: Math.round(180 * s),
    height: Math.round(60 * s),
    className: "logo-on-dark h-auto w-auto max-h-[4.5rem] max-w-[16.875rem] object-contain sm:max-h-[5.625rem]",
    style: LOGO_IMG_STYLE,
  };
}

/**
 * Uniform logo sizing (home Brands banner + Clients page grids).
 * Every logo gets the same visual area: width = k * sqrt(aspect), capped by the slot's
 * max width and max height. k / max-w / max-h come from CSS variables set per breakpoint
 * on the parent (`.logo-band`, `.logo-tile-box`), so mobile, tablet and desktop stay consistent.
 * `displayScale` in clients/agencies JSON is an optical-weight correction (0.85 to 1.3), set from
 * each logo's measured ink density so thin, detailed marks and solid blocks read as the same size.
 */
export function logoFit(entry: LogoEntry) {
  const ar = logoAspect(entry.file);
  return {
    width: Math.round(200 * ar),
    height: 200,
    className: "logo-fit logo-on-dark",
    style: { "--ar": ar.toFixed(4), "--logo-scale": String(logoScale(entry)) } as CSSProperties,
  };
}
