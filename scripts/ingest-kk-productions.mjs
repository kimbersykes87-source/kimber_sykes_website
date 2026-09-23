/**
 * Whiten vendor K&K SVG and write `public/images/logos/agencies/kk-productions.svg`.
 * Usage: node scripts/ingest-kk-productions.mjs [path-to-KandK-productions.svg]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { whitenUserSvg } from "./svg-whiten.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src =
  process.argv[2] ||
  join(process.env.USERPROFILE || process.env.HOME || "", "Downloads", "KandK-productions.svg");
const dest = join(root, "public", "images", "logos", "agencies", "kk-productions.svg");
let body = whitenUserSvg(readFileSync(src, "utf8"), "K&K Productions");
if (!/<title[\s>]/i.test(body)) {
  body = body.replace(/(<svg[^>]*>)/, "$1\n  <title>K&amp;K Productions</title>");
}
writeFileSync(dest, `<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`, "utf8");
console.log("Wrote", dest);
