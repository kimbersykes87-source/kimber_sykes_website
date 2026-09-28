import type { CSSProperties } from "react";
import type { LogoEntry } from "@/lib/types";
import { logoAspect } from "@/lib/logoAspect";

function logoScale(entry: LogoEntry): number {
  const s = entry.displayScale;
  return typeof s === "number" && s > 0 ? s : 1;
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
