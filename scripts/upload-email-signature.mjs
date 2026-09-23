#!/usr/bin/env node
/**
 * Build email-signature PNGs and upload icons + HTML to R2 (kimber-sykes-assets).
 * Requires: npx wrangler login, npm install in email-signature/
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sigDir = path.join(root, "email-signature");
const bucket = "kimber-sykes-assets";

const uploads = [
  { file: "assets/icons/phone.png", contentType: "image/png" },
  { file: "assets/icons/email.png", contentType: "image/png" },
  { file: "assets/icons/web.png", contentType: "image/png" },
  { file: "assets/icons/linkedin.png", contentType: "image/png" },
  { file: "signature-email.html", contentType: "text/html; charset=utf-8" },
  { file: "signature-thunderbird.html", contentType: "text/html; charset=utf-8" },
];

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

if (!fs.existsSync(path.join(sigDir, "node_modules"))) {
  console.log("Installing email-signature dependencies…");
  run("npm install", sigDir);
}

console.log("Building icon PNGs…");
run("npm run build-icons", sigDir);

for (const { file, contentType } of uploads) {
  const localPath = path.join(sigDir, file);
  if (!fs.existsSync(localPath)) {
    console.error(`Missing: ${localPath}`);
    process.exit(1);
  }
  const key = `email-signature/${file.replace(/\\/g, "/")}`;
  console.log(`Uploading ${key}…`);
  run(
    `npx wrangler r2 object put ${bucket}/${key} --file="${localPath}" --content-type="${contentType}" --remote`,
  );
}

console.log("Done. Deploy the assets worker: npm run assets:deploy");
