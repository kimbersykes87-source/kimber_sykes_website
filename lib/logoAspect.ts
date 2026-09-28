import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, number>();

/**
 * Width / height of a logo file's artwork, read at build time.
 * SVGs use the root viewBox (logo files are trimmed to their artwork, so this is the
 * visible shape). PNGs use the IHDR dimensions. Falls back to 2 if unreadable.
 */
export function logoAspect(publicPath: string): number {
  const hit = cache.get(publicPath);
  if (hit) return hit;
  let ar = 2;
  try {
    const abs = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    if (publicPath.toLowerCase().endsWith(".svg")) {
      const tag = fs.readFileSync(abs, "utf8").match(/<svg\b[^>]*>/)?.[0] ?? "";
      const vb = tag.match(/viewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/).map(Number);
      if (vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0) ar = vb[2] / vb[3];
      else {
        const w = parseFloat(tag.match(/\swidth="([\d.]+)/)?.[1] ?? "");
        const h = parseFloat(tag.match(/\sheight="([\d.]+)/)?.[1] ?? "");
        if (w > 0 && h > 0) ar = w / h;
      }
    } else if (publicPath.toLowerCase().endsWith(".png")) {
      const buf = fs.readFileSync(abs);
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      if (w > 0 && h > 0) ar = w / h;
    }
  } catch {
    /* keep fallback */
  }
  cache.set(publicPath, ar);
  return ar;
}
