/**
 * Classify deployed client/agency SVGs for crispness on dark UI.
 * Run: node scripts/audit-logo-crispness.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const clients = JSON.parse(readFileSync(join(root, "data", "clients.json"), "utf8"));
const agencies = JSON.parse(readFileSync(join(root, "data", "agencies.json"), "utf8"));

function classifySvg(svg, label) {
  if (/system-ui,\s*-apple-system/i.test(svg) || /<text[^>]+fill="#ffffff"/i.test(svg)) {
    return { label, tier: "text-fallback", detail: "Generated text wordmark" };
  }
  const embed = svg.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  if (embed) {
    const b64len = embed[1].length;
    const w = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    const width = w ? Number(w[1]) : 0;
    const height = w ? Number(w[2]) : 0;
    const px = width * height;
    if (width < 120 || height < 24 || px < 4000) {
      return { label, tier: "soft-raster", detail: `Embedded PNG ${width}×${height} (small)` };
    }
    if (width > 800 || height > 400) {
      return { label, tier: "heavy-raster", detail: `Embedded PNG ${width}×${height} (large file, may still look soft when scaled down)` };
    }
    return { label, tier: "raster-ok", detail: `Embedded PNG ${width}×${height}, ~${Math.round(b64len / 1024)}KB b64` };
  }
  if (/<path\s+fill="#ffffff"/i.test(svg) || /fill="#fff"/i.test(svg)) {
    return { label, tier: "vector", detail: "Vector paths (crisp)" };
  }
  return { label, tier: "unknown", detail: "Review manually" };
}

function auditRows(rows, subdir) {
  const out = [];
  for (const row of rows) {
    const path = join(root, "public", row.file.replace(/^\//, ""));
    let svg;
    try {
      svg = readFileSync(path, "utf8");
    } catch {
      out.push({ label: row.name, tier: "missing", detail: file });
      continue;
    }
    out.push(classifySvg(svg, row.name));
  }
  return out;
}

const all = [
  ...auditRows(clients, "clients"),
  ...auditRows(agencies, "agencies"),
];

const order = ["text-fallback", "soft-raster", "heavy-raster", "missing", "unknown", "raster-ok", "vector"];
for (const tier of order) {
  const group = all.filter((r) => r.tier === tier);
  if (!group.length) continue;
  console.log(`\n## ${tier} (${group.length})`);
  for (const r of group) console.log(`- ${r.label}: ${r.detail}`);
}

console.log("\nSummary:", Object.fromEntries(order.map((t) => [t, all.filter((r) => r.tier === t).length])));
