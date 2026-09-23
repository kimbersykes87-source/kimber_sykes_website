/**
 * Whitens agency SVGs and writes canonical filenames under `public/images/logos/agencies/`
 * matching `data/agencies.json`. Drops raw exports named like `Wonder_id….svg` after ingest.
 *
 * Run: node scripts/sync-agency-logos.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { whitenUserSvg } from "./svg-whiten.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const agenciesDir = join(root, "public", "images", "logos", "agencies");
const agencies = JSON.parse(readFileSync(join(root, "data", "agencies.json"), "utf8"));

/** Raw SVG filename prefix → `agencies.json` id (long Figma/export names in repo root). */
const INCOMING_PREFIXES = [
  ["wonder", /^Wonder_/i],
  ["emotive", /^Emotive_/i],
  ["imagination", /^Imagination_/i],
  ["pulse-group", /^Pulse_Group_/i],
  ["bacchus", /^Bacchus_/i],
  ["octagon", /^Octagon_/i],
  ["yakusan", /^Yakusan_/i],
];

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripVueAndWhiten(svg, title) {
  let s = svg.replace(/\s*data-v-[a-zA-Z0-9]+="[^"]*"/g, "");
  s = whitenUserSvg(s, title);
  if (!/<title[\s>]/i.test(s)) {
    const t = escapeXml(title);
    s = s.replace(/(<svg[^>]*>)/, `$1\n  <title>${t}</title>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${s}`;
}

/** Illustrator “frame” rect: stroke-only in source; whiten would force a solid white fill. */
function fixAmplifyFrameRect(svg) {
  return svg.replace(
    /<rect\s+x="7"[^>]*y="6\.5"[^>]*width="356\.99"[^>]*height="356\.99"[^>]*\/>/,
    '<rect x="7" y="6.5" width="356.99" height="356.99" fill="none" stroke="#ffffff" stroke-width="11" stroke-miterlimit="10" vector-effect="non-scaling-stroke"/>',
  );
}

function textWordmarkLines(name) {
  const t = name.trim();
  const words = t.split(/\s+/);
  if (words.length < 2 || t.length < 14) return [t];
  const half = t.length / 2;
  let acc = 0;
  let splitAt = 1;
  for (let i = 0; i < words.length - 1; i++) {
    acc += words[i].length + (i === 0 ? 0 : 1);
    if (acc >= half) {
      splitAt = i + 1;
      break;
    }
  }
  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

function textWordmarkSvg(name) {
  const lines = textWordmarkLines(name);
  const t = escapeXml(name);
  const maxLen = Math.max(...lines.map((l) => l.length), 12);
  const fs = Math.min(18, Math.max(10, 200 / maxLen));
  const font = "system-ui, -apple-system, Segoe UI, sans-serif";
  const texts =
    lines.length === 1
      ? `<text x="120" y="34" text-anchor="middle" fill="#ffffff" font-family="${font}" font-size="${fs}" font-weight="600">${escapeXml(lines[0])}</text>`
      : `<text x="120" y="22" text-anchor="middle" fill="#ffffff" font-family="${font}" font-size="${fs}" font-weight="600">${escapeXml(lines[0])}</text>
  <text x="120" y="44" text-anchor="middle" fill="#ffffff" font-family="${font}" font-size="${fs}" font-weight="600">${escapeXml(lines[1])}</text>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 56" role="img" aria-label="${t}" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <title>${t}</title>
  ${texts}
</svg>
`;
}

function incomingIdForFilename(name) {
  for (const [id, re] of INCOMING_PREFIXES) {
    if (re.test(name)) return id;
  }
  return null;
}

function main() {
  mkdirSync(agenciesDir, { recursive: true });

  const names = readdirSync(agenciesDir).filter((n) => n.endsWith(".svg") && n !== ".gitkeep");
  const jsonIds = new Set(agencies.map((a) => `${a.id}.svg`));

  for (const name of names) {
    if (jsonIds.has(name)) continue;
    const id = incomingIdForFilename(name);
    if (!id) continue;
    const row = agencies.find((a) => a.id === id);
    if (!row) {
      console.warn("Skip unknown incoming (no agencies.json id):", name);
      continue;
    }
    const srcPath = join(agenciesDir, name);
    const outPath = join(agenciesDir, `${id}.svg`);
    const raw = readFileSync(srcPath, "utf8");
    let body = stripVueAndWhiten(raw, row.name);
    if (id === "amplify") body = fixAmplifyFrameRect(body);
    writeFileSync(outPath, body, "utf8");
    rmSync(srcPath, { force: true });
    console.log("OK (import SVG → white)", id);
  }

  for (const row of agencies) {
    const outPath = join(agenciesDir, basename(row.file));
    if (existsSync(outPath)) continue;
    writeFileSync(outPath, textWordmarkSvg(row.name), "utf8");
    console.log("OK (text fallback)", row.id);
  }

  const amplifyPath = join(agenciesDir, "amplify.svg");
  if (existsSync(amplifyPath)) {
    const fixed = fixAmplifyFrameRect(readFileSync(amplifyPath, "utf8"));
    writeFileSync(amplifyPath, fixed, "utf8");
  }

  const gitkeep = join(agenciesDir, ".gitkeep");
  if (!existsSync(gitkeep)) writeFileSync(gitkeep, "", "utf8");

  console.log("Wrote", agencies.length, "agency SVGs to public/images/logos/agencies/");
}

main();
