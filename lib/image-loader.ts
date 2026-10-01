/**
 * next/image custom loader (static export). Photos under /images/work and /images/about are
 * served as pre-generated WebP variants from scripts/optimize-images.mjs; everything else
 * (SVG logos etc.) is returned unchanged. Keep WIDTHS in sync with that script.
 */
const WIDTHS = [640, 1280, 1920];

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const m = src.match(/^\/images\/(work|about)\/(.+)\.(jpe?g|png)$/i);
  if (!m) return src;
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `/images/_opt/${m[1]}/${m[2]}-${w}.webp`;
}
