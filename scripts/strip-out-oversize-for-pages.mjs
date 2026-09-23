/**
 * Cloudflare Pages rejects static assets over ~25 MiB. Remove them from `out/` before `wrangler pages deploy`.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const MAX = 25 * 1024 * 1024;

function walk(dir) {
  /** @type {string[]} */
  const acc = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) acc.push(...walk(p));
    else acc.push(p);
  }
  return acc;
}

if (!fs.existsSync(OUT)) {
  console.error("strip-out-oversize-for-pages: missing out/ — run next build first");
  process.exit(1);
}

const files = walk(OUT);
let removed = 0;
for (const file of files) {
  const sz = fs.statSync(file).size;
  if (sz >= MAX) {
    console.warn(
      `Removing ${path.relative(process.cwd(), file)} (${(sz / (1024 * 1024)).toFixed(1)} MiB >= 25 MiB Pages limit)`,
    );
    fs.unlinkSync(file);
    removed++;
  }
}

if (removed === 0) console.log("strip-out-oversize-for-pages: no files >= 25 MiB");
