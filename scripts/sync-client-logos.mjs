/**
 * Syncs `public/images/logos/clients/{id}.svg` from:
 * 1) Optional source SVG (`resources/logo-sources` or `_archive`), whitened
 * 2) Optional bundled SVG in `public/images/logos/bundled/{id}.svg` (repo-shipped wordmarks etc.)
 * 3) simple-icons (white path on 24×24 vector), preferred over EPS; viewBox cropped top/bottom via path bbox (still vector)
 * 4) Optional EPS/AI/SVG from `resources/logo-sources/` or `_archive/**` → white silhouette PNG in SVG, then **trim** empty margins
 * 5) Text wordmark fallback
 *
 * Requires: ImageMagick (`magick.exe`, resolved under Program Files if not on PATH) + Ghostscript (`gswin64c.exe`).
 *
 * Archives loose files in clients/ to `_archive/<iso-timestamp>/` first.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, delimiter, dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

import { whitenUserSvg } from "./svg-whiten.mjs";

const require = createRequire(import.meta.url);
/** @type {Record<string, import('simple-icons').SimpleIcon>} */
const SimpleIcons = require("simple-icons");
const { svgPathBbox } = require("svg-path-bbox");

/** simple-icons artboard (paths are authored in this space). */
const SI_W = 24;
const SI_H = 24;

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const clientsDir = join(root, "public", "images", "logos", "clients");
const bundledDir = join(root, "public", "images", "logos", "bundled");
/** EPS/AI shipped in-repo (not Dropbox); checked before `_archive/**`. */
const vendorVectorDir = join(root, "resources", "logo-sources");
const clients = JSON.parse(readFileSync(join(root, "data", "clients.json"), "utf8"));

/** simple-icons export keys (camelCase after `si`). Vector SVG only (no raster), sharp at any size, matches SI paths. */
const SI_KEY = {
  netflix: "siNetflix",
  visa: "siVisa",
  samsung: "siSamsung",
  xero: "siXero",
  "ea-sports": "siEa",
  sony: "siSony",
  soundcloud: "siSoundcloud",
  peugeot: "siPeugeot",
  infiniti: "siInfiniti",
  "american-express": "siAmericanexpress",
  instagram: "siInstagram",
  cnn: "siCnn",
  marriott: "siMarriott",
};

/** Prefer these SVGs (repo `resources/logo-sources` or latest `_archive`) over EPS / simple-icons / bundled. */
const SOURCE_SVG = {
  "ntt-data": "ntt-data-seeklogo.com.svg",
  "walt-disney": "Walt_Disney_Pictures.svg",
  "google-cloud": "google-cloud.svg",
  mastercard: "mastercard.svg",
  canva: "canva.svg",
  "commonwealth-bank": "commonwealth-bank.svg",
  emirates: "Emirates_Airlines.svg",
  "emirates-skycargo": "Emirates_SkyCargo.svg",
  "johnson-johnson": "johnsonandjohnson.svg",
  "stella-mccartney": "stellamcartney.svg",
  aperol: "Aperol.svg",
  mtv: "mtv.svg",
  microsoft: "Microsoft.svg",
  diageo: "DIAGEO.svg",
  philips: "Philips-logo.svg",
  geely: "geely.svg",
  jaguar: "Jaguar.svg",
  lilly: "Lilly.svg",
  "destination-nsw": "destination-nsw.svg",
  "tourism-nt": "tourism_nt_blk.svg",
  "dp-world": "DP World.svg",
  "b-braun": "bbraun.svg",
  peugeot: "peugot.svg",
  "jumeirah-hotels": "jumeirah.svg",
  "expo-2020": "expo-2020.svg",
  rizla: "Rizla.svg",
  schwarzkopf: "schwarzkopf.svg",
  "reed-elsevier": "reed-elsevier.svg",
  tiger: "tiger.svg",
};

/**
 * EPS/AI/WebP/JPEG/PNG in `resources/logo-sources/` (or `_archive`) → embedded PNG SVG.
 * Key = `clients.json` id, value = filename under logo-sources.
 */
const SOURCE_VECTOR = {
  dnata: "dnata.eps",
  "intercontinental-hotels": "intercontinental.ai",
  pfizer: "Pfizer.ai",
  "gunpowder-plot": "gunpowder-plot.webp",
};

/** Raster masters outside logo-sources (absolute path from repo root). */
const SOURCE_RASTER = {};

/** Per-source tweaks before `whitenUserSvg` (vendor quirks). Key = `SOURCE_SVG` value. */
const WHITEN_PREPROCESS = {
  "Emirates_SkyCargo.svg": (raw) =>
    raw.replace(/<polygon\b[^>]*\bclass="st1"[^>]*\/>/gi, ""),
};

/** Per-client-id tweaks after `whitenUserSvg` (viewBox / layout). */
const CLIENT_SVG_POST = {
  /** Wordmark sits low in 512² artboard. Tight viewBox so `object-contain` scales like other logos. */
  canva: (svg) => svg.replace(/viewBox="0 0 512 512"/i, 'viewBox="0 138 512 224"'),
  /** Compound path: white disc with dot-letter knockouts. */
  "stella-mccartney": (svg) =>
    svg.replace(/<path(\s+)d="/, '<path$1fill-rule="evenodd" d="'),
};

function finalizeClientSvg(id, svg) {
  const fn = CLIENT_SVG_POST[id];
  return fn ? fn(svg) : svg;
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getProgramFiles() {
  return process.env["ProgramFiles"] || "C:\\Program Files";
}

function getGhostscriptBinDir() {
  const base = join(getProgramFiles(), "gs");
  if (!existsSync(base)) return null;
  const versions = readdirSync(base).filter((d) => d.startsWith("gs") && existsSync(join(base, d, "bin", "gswin64c.exe")));
  if (!versions.length) return null;
  versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  return join(base, versions[0], "bin");
}

/** Full path to magick.exe. Node often inherits a PATH without ImageMagick; CLI shells do not. */
function getMagickExecutable() {
  const fromEnv = process.env["MAGICK_EXE"] || process.env["IMAGEMAGICK_BINARY"];
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const pf = getProgramFiles();
  if (!existsSync(pf)) return "magick";
  const dirs = readdirSync(pf).filter((d) => /^ImageMagick/i.test(d));
  dirs.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  for (const d of dirs) {
    const exe = join(pf, d, "magick.exe");
    if (existsSync(exe)) return exe;
  }
  return "magick";
}

function magickEnv() {
  const gsBin = getGhostscriptBinDir();
  const env = { ...process.env };
  if (gsBin) env.PATH = `${gsBin}${delimiter}${env.PATH || ""}`;
  return env;
}

/** Wrap a PNG file as minimal client SVG (caller deletes `pngPath` after). */
function embeddedSvgFromPngFile(magickExe, pngPath, title) {
  const env = magickEnv();
  const dim = spawnSync(magickExe, [pngPath, "-format", "%w %h", "info:"], { env, encoding: "utf8" });
  let w = "";
  let h = "";
  if (dim.status === 0 && dim.stdout) {
    const parts = dim.stdout.trim().split(/\s+/);
    if (parts.length >= 2) {
      w = parts[0];
      h = parts[1];
    }
  }
  let b64 = "";
  try {
    b64 = readFileSync(pngPath).toString("base64");
  } catch {
    return null;
  }
  if (!b64 || !w || !h) return null;
  const t = escapeXml(title);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}px" height="${h}px" role="img" aria-label="${t}">
  <title>${t}</title>
  <image width="${w}" height="${h}" xlink:href="data:image/png;base64,${b64}"/>
</svg>
`;
}

/**
 * EPS/AI/SVG → minimal SVG with one embedded PNG: white on transparent, then `-trim` so extra canvas (e.g. J&J) is removed.
 * Returns SVG string or null.
 */
function convertVectorToSvg(magickExe, vectorPath, title) {
  const base = join(tmpdir(), `ks-logo-${randomBytes(8).toString("hex")}`);
  const pngTmp = `${base}.png`;
  const normalized = vectorPath.replace(/\\/g, "/");
  /** EPS/AI: `[0]` skips embedded TIFF preview; SVG must be read as a single rasterized page. */
  const input = /\.svg$/i.test(normalized) ? normalized : `${normalized}[0]`;
  const env = magickEnv();
  const common = [
    input,
    "-density",
    "400",
    "-background",
    "white",
    "-flatten",
    "-resize",
    "1200x420>",
    "-colorspace",
    "sRGB",
    "-fuzz",
    "4%",
    "-transparent",
    "white",
    "-channel",
    "RGB",
    "-evaluate",
    "set",
    "100%",
    "+channel",
    pngTmp,
  ];
  const r = spawnSync(magickExe, common, { env, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
  if (r.status !== 0 || !existsSync(pngTmp)) {
    if (r.stderr) console.warn("magick:", r.stderr.slice(0, 400));
    try {
      rmSync(pngTmp, { force: true });
    } catch {
      /* ignore */
    }
    return null;
  }

  const trimmedTmp = `${base}-trim.png`;
  const trimR = spawnSync(
    magickExe,
    [pngTmp, "-fuzz", "2%", "-trim", "+repage", trimmedTmp],
    { env, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );
  let finalPng = pngTmp;
  if (trimR.status === 0 && existsSync(trimmedTmp)) {
    try {
      rmSync(pngTmp, { force: true });
    } catch {
      /* ignore */
    }
    finalPng = trimmedTmp;
  }

  const embedded = embeddedSvgFromPngFile(magickExe, finalPng, title);
  try {
    rmSync(finalPng, { force: true });
  } catch {
    /* ignore */
  }
  return embedded;
}

/** Tighter viewBox: same 24px width, crop empty space above/below the path (vector, no raster). */
function simpleIconVerticalTrimViewBox(pathD) {
  const f = (n) => Number(n.toFixed(4));
  const [, minY, , maxY] = svgPathBbox(pathD);
  const pad = 0.15;
  const y0 = f(Math.max(0, minY - pad));
  const y1 = f(Math.min(SI_H, maxY + pad));
  const h = f(y1 - y0);
  if (!(h > 0) || !Number.isFinite(h)) return `0 0 ${SI_W} ${SI_H}`;
  return `0 ${y0} ${SI_W} ${h}`;
}

function svgFromSimpleIcon(icon) {
  const title = escapeXml(icon.title);
  const vb = simpleIconVerticalTrimViewBox(icon.path);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <title>${title}</title>
  <path fill="#ffffff" d="${icon.path}"/>
</svg>
`;
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

/**
 * @param {Set<string>} keepFilenames
 */
function archiveExistingFiles(keepFilenames) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = join(clientsDir, "_archive", stamp);
  mkdirSync(dest, { recursive: true });
  const skip = new Set([".gitkeep", "_archive"]);
  let n = 0;
  for (const name of readdirSync(clientsDir)) {
    if (skip.has(name) || keepFilenames.has(name)) continue;
    renameSync(join(clientsDir, name), join(dest, name));
    n++;
  }
  if (n) console.log("Archived", n, "loose file(s) to", dest);
}

function findArchivedFile(filename) {
  const arch = join(clientsDir, "_archive");
  if (!existsSync(arch)) return null;
  const dirs = readdirSync(arch).sort().reverse();
  for (const d of dirs) {
    const p = join(arch, d, filename);
    if (existsSync(p)) return p;
  }
  return null;
}

/** Prefer `resources/logo-sources` + filename, then latest `_archive` subfolder + filename. */
function resolveVectorSource(filename) {
  const vendorPath = join(vendorVectorDir, filename);
  if (existsSync(vendorPath)) return vendorPath;
  return findArchivedFile(filename);
}

function resolveSvgSource(filename) {
  const vendorPath = join(vendorVectorDir, filename);
  if (existsSync(vendorPath)) return vendorPath;
  return findArchivedFile(filename);
}

function main() {
  const gs = getGhostscriptBinDir();
  if (!gs) console.warn("Ghostscript bin not found under Program Files\\gs. EPS/AI conversion may fail.");
  else console.log("Using Ghostscript:", join(gs, "gswin64c.exe"));

  const magickExe = getMagickExecutable();
  if (magickExe === "magick")
    console.warn("ImageMagick not found under Program Files -- ensure magick is on PATH.");
  else console.log("Using ImageMagick:", magickExe);

  mkdirSync(clientsDir, { recursive: true });
  const keepOutputs = new Set(clients.map((c) => basename(c.file)));
  archiveExistingFiles(keepOutputs);

  for (const row of clients) {
    const id = row.id;
    const name = row.name;
    const outPath = join(root, "public", ...row.file.split("/").filter(Boolean));

    let body = "";

    const svgSrc = SOURCE_SVG[id];
    if (svgSrc) {
      const candidate = resolveSvgSource(svgSrc);
      if (candidate) {
        let raw = readFileSync(candidate, "utf8");
        const pre = WHITEN_PREPROCESS[svgSrc];
        if (pre) raw = pre(raw);
        body = whitenUserSvg(raw, name);
        console.log("OK (source SVG)", id);
      }
    }

    if (!body) {
      const bundledPath = join(bundledDir, `${id}.svg`);
      if (existsSync(bundledPath)) {
        body = whitenUserSvg(readFileSync(bundledPath, "utf8"), name);
        console.log("OK (bundled SVG)", id);
      }
    }

    if (!body && SI_KEY[id]) {
      const icon = SimpleIcons[SI_KEY[id]];
      if (icon?.path) {
        body = svgFromSimpleIcon(icon);
        console.log("OK (simple-icons)", id);
      } else {
        console.warn("Missing simple-icons:", SI_KEY[id]);
      }
    }

    if (!body && SOURCE_VECTOR[id]) {
      const candidate = resolveVectorSource(SOURCE_VECTOR[id]);
      if (candidate) {
        const converted = convertVectorToSvg(magickExe, candidate, name);
        if (converted) {
          body = converted;
          console.log("OK (vector/raster → SVG)", id);
        }
      }
    }

    if (!body && SOURCE_RASTER[id] && existsSync(SOURCE_RASTER[id])) {
      const converted = convertVectorToSvg(magickExe, SOURCE_RASTER[id], name);
      if (converted) {
        body = converted;
        console.log("OK (raster master → SVG)", id);
      }
    }

    if (!body) {
      body = textWordmarkSvg(name);
      console.log("OK (text fallback)", id);
    }

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, finalizeClientSvg(id, body), "utf8");
  }

  const gitkeep = join(clientsDir, ".gitkeep");
  if (!existsSync(gitkeep)) writeFileSync(gitkeep, "", "utf8");

  console.log("Wrote", clients.length, "SVGs to public/images/logos/clients/");
}

main();
