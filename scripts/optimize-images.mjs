/**
 * Prebuild: writes responsive WebP variants of every photo in public/images/{work,about}
 * to public/images/_opt/<same path>-{640,1280,1920}.webp (gitignored, regenerated as needed).
 * lib/image-loader.ts maps next/image requests to these files. Originals stay untouched and
 * are still used for Open Graph and JSON-LD (social scrapers prefer JPEG).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const WIDTHS = [640, 1280, 1920];
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outRoot = path.join(publicDir, "images", "_opt");
const SOURCES = ["work", "about"];
const QUALITY = 72;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(jpe?g|png)$/i.test(name)) acc.push(full);
  }
  return acc;
}

const jobs = [];
for (const src of SOURCES.flatMap((s) => walk(path.join(publicDir, "images", s)))) {
  const rel = path.relative(path.join(publicDir, "images"), src).replace(/\.(jpe?g|png)$/i, "");
  const srcTime = fs.statSync(src).mtimeMs;
  for (const w of WIDTHS) {
    const dest = path.join(outRoot, `${rel}-${w}.webp`);
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= srcTime) continue;
    jobs.push({ src, dest, w });
  }
}

let done = 0;
async function worker() {
  while (jobs.length) {
    const { src, dest, w } = jobs.shift();
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await sharp(src)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(dest);
    done++;
  }
}

// Remove variants whose source photo was renamed or deleted, so stale files never deploy.
const expected = new Set();
for (const src of SOURCES.flatMap((s) => walk(path.join(publicDir, "images", s)))) {
  const rel = path.relative(path.join(publicDir, "images"), src).replace(/\.(jpe?g|png)$/i, "");
  for (const w of WIDTHS) expected.add(path.join(outRoot, `${rel}-${w}.webp`));
}
let pruned = 0;
(function prune(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) prune(full);
    else if (name.endsWith(".webp") && !expected.has(full)) {
      fs.unlinkSync(full);
      pruned++;
    }
  }
})(outRoot);
if (pruned) console.log(`optimize-images: removed ${pruned} stale variant(s)`);

const total = jobs.length;
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`optimize-images: ${done} of ${total} variant(s) written (others up to date)`);
