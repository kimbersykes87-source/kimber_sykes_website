/**
 * Raster masters in `resources/agency-rasters/*` → `public/images/logos/agencies/*.svg`
 * (transparent matte, trimmed, embedded PNG for consistent `logo-on-dark` use).
 * Optional `whiteForeground`: knock out `transparent` color, then set RGB to white while keeping alpha.
 *
 * Usage: npm run build:agency-raster-svgs
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const agenciesDir = join(root, "public", "images", "logos", "agencies");
const rastersDir = join(root, "resources", "agency-rasters");

const magick =
  process.env.MAGICK_EXE ||
  "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

/** @type {{ file: string; dest: string; label: string; fuzz: string; transparent: string; whiteForeground?: boolean; maxWidth?: number }[]} */
const jobs = [
  {
    file: "we-are-listen.png",
    dest: join(agenciesDir, "we-are-listen.svg"),
    label: "We Are Listen",
    fuzz: "6%",
    transparent: "#000000",
  },
  {
    file: "exposure.png",
    dest: join(agenciesDir, "exposure.svg"),
    label: "EXPOSUREPR",
    fuzz: "5%",
    transparent: "#000000",
  },
  {
    file: "blondefish.png",
    dest: join(agenciesDir, "blondefish.svg"),
    label: "Blondefish",
    fuzz: "8%",
    transparent: "#000000",
    whiteForeground: true,
  },
  {
    file: "curiious.jpeg",
    dest: join(agenciesDir, "curiious.svg"),
    label: "Curiious",
    fuzz: "12%",
    transparent: "#FFFFFF",
    whiteForeground: true,
  },
  {
    file: "bmf.png",
    dest: join(agenciesDir, "bmf.svg"),
    label: "BMF",
    fuzz: "8%",
    transparent: "#000000",
    whiteForeground: true,
    maxWidth: 480,
  },
  {
    file: "INVNT.webp",
    dest: join(agenciesDir, "invnt.svg"),
    label: "INVNT",
    fuzz: "10%",
    transparent: "#000000",
    whiteForeground: true,
    maxWidth: 480,
  },
  {
    file: "AGB.webp",
    dest: join(agenciesDir, "agb-events.svg"),
    label: "AGB Events",
    fuzz: "10%",
    transparent: "#000000",
    whiteForeground: true,
  },
];

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function magickInfo(pngPath, format) {
  const r = spawnSync(magick, [pngPath, "-format", format, "info:"], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr || "magick info failed");
  return r.stdout.trim();
}

function main() {
  mkdirSync(agenciesDir, { recursive: true });

  for (const job of jobs) {
    const src = join(rastersDir, job.file);
    if (!existsSync(src)) {
      console.warn("Skip (missing master):", src);
      continue;
    }
    const tmp = join(tmpdir(), `ks-agency-${randomBytes(8).toString("hex")}.png`);
    const args = [src, "-fuzz", job.fuzz, "-transparent", job.transparent, "-trim", "+repage"];
    if (job.whiteForeground) args.push("-channel", "RGB", "-evaluate", "set", "100%", "+channel");
    args.push("PNG32:" + tmp);
    let r = spawnSync(magick, args, { encoding: "utf8" });
    if (r.status !== 0) throw new Error(r.stderr || "magick convert failed");

    if (job.maxWidth) {
      const rawW = Number(magickInfo(tmp, "%w"));
      if (rawW > job.maxWidth) {
        const resized = join(tmpdir(), `ks-agency-r-${randomBytes(8).toString("hex")}.png`);
        r = spawnSync(magick, [tmp, "-resize", `${job.maxWidth}x`, "PNG32:" + resized], { encoding: "utf8" });
        if (r.status !== 0) throw new Error(r.stderr || "magick resize failed");
        try {
          unlinkSync(tmp);
        } catch {
          /* ignore */
        }
        writeFileSync(tmp, readFileSync(resized));
        try {
          unlinkSync(resized);
        } catch {
          /* ignore */
        }
      }
    }

    const w = magickInfo(tmp, "%w");
    const h = magickInfo(tmp, "%h");
    const b64 = readFileSync(tmp).toString("base64");
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    const label = escapeXml(job.label);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}" shape-rendering="geometricPrecision">
  <title>${label}</title>
  <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${b64}"/>
</svg>
`;
    writeFileSync(job.dest, svg, "utf8");
    console.log("Wrote", job.dest, `${w}x${h}`);
  }
}

main();
