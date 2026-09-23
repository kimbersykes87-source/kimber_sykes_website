/**
 * Writes public/llms.txt before static export so AI agents can fetch /llms.txt.
 * Keep in sync with lib/llms-txt.ts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://kimbersykes.com").replace(/\/$/, "");

const LINKEDIN_URL = "https://uk.linkedin.com/in/kimber-sykes-33400326";

const CONTACT = {
  email: "kimber@kimbersykes.com",
  phoneUk: "+447553673133",
  phoneUs: "+13235362611",
};

function excerptFirstSentence(body) {
  const sentences = body.trim().split(/(?<=[.!?])\s+/);
  const first = sentences[0]?.trim();
  if (first && first.length >= 40) return first.endsWith(".") ? first : `${first}.`;
  return body.trim().slice(0, 160);
}

const projects = JSON.parse(readFileSync(join(root, "data/projects.json"), "utf8"));

const lines = [
  "# Kimber Sykes — Freelance Executive Producer",
  "",
  "> Freelance Executive Producer, Production Manager, and Technical Director based in London. 23 years of experience across 16 countries and seven-figure budgets. Specialising in large-scale corporate events, conferences, summits, and experiential brand activations. Available for contract project leadership across Europe and globally.",
  "",
  "## Services",
  "",
  "- Executive production for corporate conferences, summits, and product launches",
  "- Experiential and brand activations",
  "- On-site production management, build supervision, and de-rig oversight",
  "- Technical direction, AV delivery, and show flow",
  "- Vendor sourcing, budget management, and project leadership for seven-figure events",
  "",
  "## Case studies",
  "",
];

for (const p of projects) {
  const summary = excerptFirstSentence(p.body);
  lines.push(
    `- [${p.client} — ${p.project}](${site}/work/${p.slug}): ${summary}`,
  );
}

lines.push(
  "",
  "## Contact",
  "",
  `- Website: ${site}`,
  `- LinkedIn: ${LINKEDIN_URL}`,
  `- Contact form: ${site}/contact`,
  `- Email: ${CONTACT.email}`,
  `- Phone (UK): +44 755 367 3133`,
  `- Phone (US): +1 323 536 2611`,
  "",
  "## Optional",
  "",
  `- [Sitemap](${site}/sitemap.xml): All indexable URLs`,
  `- [Robots](${site}/robots.txt): Crawler policy (AI agents allowed)`,
  "",
);

const out = join(root, "public/llms.txt");
writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${out} (${projects.length} projects)`);
