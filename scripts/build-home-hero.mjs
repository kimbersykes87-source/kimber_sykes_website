/**
 * Build homepage hero derivatives.
 *
 * Usage:
 *   node scripts/build-home-hero.mjs [source]
 *
 * Default source: public/images/home/ks_home.jpeg
 *
 * Writes (and keeps) only:
 *   public/images/home/ks_home.jpg        2400px wide, JPEG q78 progressive
 *   public/images/home/ks_home.webp       2400px wide, WebP q75
 *   public/images/home/ks_home-1200.jpg   1200px wide, JPEG q78 progressive
 *   public/images/home/ks_home-1200.webp  1200px wide, WebP q75
 *
 * Copies the source into public/images/home/ first, then deletes every file in
 * that directory that is not one of the four web outputs (so the original is
 * not shipped).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "images", "home");
const defaultSource = path.join(outDir, "ks_home.jpeg");
const sourceArg = process.argv[2];
const source = path.resolve(sourceArg ?? defaultSource);

const outputs = [
  { width: 2400, jpg: "ks_home.jpg", webp: "ks_home.webp" },
  { width: 1200, jpg: "ks_home-1200.jpg", webp: "ks_home-1200.webp" },
];
const keep = new Set(outputs.flatMap((item) => [item.jpg, item.webp]));

if (!fs.existsSync(source)) {
  console.error(`Missing source image: ${source}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const stagedPath = path.join(outDir, path.basename(source));
if (path.resolve(source) !== path.resolve(stagedPath)) {
  fs.copyFileSync(source, stagedPath);
}

const input = fs.readFileSync(stagedPath);

for (const item of outputs) {
  const resized = () => sharp(input).rotate().resize({ width: item.width, withoutEnlargement: false });

  await resized().jpeg({ quality: 78, progressive: true }).toFile(path.join(outDir, item.jpg));
  await resized().webp({ quality: 75 }).toFile(path.join(outDir, item.webp));
}

for (const name of fs.readdirSync(outDir)) {
  if (!keep.has(name)) {
    fs.unlinkSync(path.join(outDir, name));
    console.log(`deleted public/images/home/${name}`);
  }
}

for (const name of [...keep].sort()) {
  const file = path.join(outDir, name);
  const meta = await sharp(file).metadata();
  const bytes = fs.statSync(file).size;
  console.log(
    `${name}  ${meta.width}x${meta.height}  ${meta.format}  ${(bytes / 1024).toFixed(0)} KB`,
  );
}
