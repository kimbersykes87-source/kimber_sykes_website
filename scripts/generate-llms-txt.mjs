/**
 * Prebuild: writes public/llms.txt (short index, llmstxt.org format) and public/llms-full.txt
 * (full text of every case study) for AI answer engines.
 * Sources of truth: data/site.json (identity), data/projects.json, data/clients.json,
 * data/agencies.json, data/delivery-locations.json, data/map.json.
 * House style: British English, no em or en dashes (the script fails the build if any appear).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://kimbersykes.com").replace(/\/$/, "");
const read = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const id = read("data/site.json");
const projects = read("data/projects.json");
const clients = read("data/clients.json").map((c) => c.name);
const agencies = read("data/agencies.json").map((a) => a.name);
const locations = read("data/delivery-locations.json");
const countryCount = read("data/map.json").length;

const SECTOR_ORDER = ["B2B Tech", "Consumer", "Sports", "Other"];
const linkedIn = id.sameAs.find((u) => u.includes("linkedin.com"));

function firstSentence(body) {
  const s = body.trim().split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
  return s.length >= 40 ? s : body.trim().slice(0, 160);
}
function title(p) {
  return p.project.toLowerCase().includes(p.client.toLowerCase()) ? p.project : `${p.client}: ${p.project}`;
}
function facts(p) {
  const agency = p.agency && p.agency !== "Independent" ? ` for ${p.agency}` : " (independent)";
  return `${p.client}, ${p.location}, ${p.year}. Kimber's credit: ${p.role}${agency}.`;
}
const url = (p) => `${site}/work/${p.slug}`;
const bySector = (sector) => projects.filter((p) => p.sector === sector);

const intro = [
  `# ${id.name}`,
  "",
  `> ${id.oneLiner}`,
  "",
  `${id.name} has ${id.yearsExperience} years of experience in live events and has delivered work on site in ${countryCount} countries. He is based in ${id.baseLocality} and works worldwide, usually engaged by agencies to lead production for their clients. Role credits on this site are stated exactly as given on each project.`,
  "",
];

const profile = [
  "## Profile",
  "",
  `- Name: ${id.name}`,
  `- Roles: ${id.roles.join(", ")}`,
  `- Based: ${id.baseLocality}, ${id.baseCountryName}; works worldwide`,
  `- Experience: ${id.yearsExperience} years`,
  `- Sectors: ${SECTOR_ORDER.filter((s) => bySector(s).length).map((s) => id.sectors[s]).join(", ")}`,
  `- Specialisms: ${id.knowsAbout.join(", ")}`,
  `- Clients include: ${clients.join(", ")}`,
  `- Agencies worked with include: ${agencies.join(", ")}`,
  "",
];

const services = ["## Services", ""];
for (const svc of id.services ?? []) {
  services.push(`### ${svc.name}`, "", `- [${svc.name} on the About page](${site}/about#${svc.id})`, "", svc.intro, "");
  services.push("What's included:", ...svc.included.map((i) => `- ${i}`), "", `Typical projects: ${svc.typical}`, "");
  const links = svc.caseStudies.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);
  services.push(`Case studies: ${links.map((p) => `[${title(p)}](${url(p)})`).join(", ")}`, "");
}

const career = ["## Career summary", ""];
for (const c of id.career ?? []) career.push(`- ${c.years}: ${c.organisation}, ${c.place}. ${c.role}. ${c.summary}`);
career.push("");

const contact = [
  "## Contact",
  "",
  `- [Contact page](${site}/contact): email, phone and LinkedIn`,
  `- Email: ${id.contact.email}`,
  `- Phone (UK): ${id.contact.phoneUkDisplay}`,
  `- Phone (US): ${id.contact.phoneUsDisplay}`,
  `- LinkedIn: ${linkedIn}`,
  "",
];

// ---------- llms.txt ----------
const short = [...intro, ...profile, ...services, ...career];
short.push("## Key pages", "");
short.push(`- [About ${id.name}](${site}/about): background, roles, specialisms and credentials`);
short.push(`- [Work](${site}/work): all ${projects.length} case studies, grouped by sector`);
short.push(`- [Clients and agencies](${site}/clients): brands and agencies worked with`);
short.push(`- [Where I have worked](${site}/where): countries and cities with on-site delivery`);
short.push(`- [Full text for AI agents](${site}/llms-full.txt): every case study in full`, "");
for (const sector of SECTOR_ORDER) {
  const list = bySector(sector);
  if (!list.length) continue;
  short.push(`## Case studies: ${id.sectors[sector]}`, "");
  for (const p of list) short.push(`- [${title(p)}](${url(p)}): ${facts(p)} ${p.summary ?? firstSentence(p.body)}`);
  short.push("");
}
short.push(...contact);
short.push("## Optional", "", `- [Sitemap](${site}/sitemap.xml): all indexable URLs`, "");

// ---------- llms-full.txt ----------
const full = [...intro, ...profile, ...services, ...career];
full.push("## Where Kimber has delivered work on site", "");
for (const l of locations) full.push(`- ${l.country}: ${l.cities.join(", ")}`);
full.push("");
for (const sector of SECTOR_ORDER) {
  const list = bySector(sector);
  if (!list.length) continue;
  full.push(`## Case studies: ${id.sectors[sector]}`, "");
  for (const p of list) {
    full.push(`### ${title(p)}`, "");
    full.push(`- URL: ${url(p)}`);
    full.push(`- Client: ${p.client}`);
    full.push(`- Project: ${p.project}`);
    full.push(`- Kimber's credit: ${p.role}`);
    full.push(`- Agency: ${p.agency}`);
    full.push(`- Location: ${p.location}`);
    full.push(`- Year: ${p.year}`, "");
    if (p.summary) {
      full.push(p.summary, "");
      if (p.brief) full.push("What was the brief?", "", p.brief, "");
      const lists = [
        ["Scale and constraints", p.scale],
        ["What was Kimber responsible for?", p.responsibilities],
        ["Technical and production highlights", p.highlights],
      ];
      for (const [h, items] of lists) if (items?.length) full.push(`${h}`, "", ...items.map((i) => `- ${i}`), "");
      if (p.outcome) full.push("Outcome", "", p.outcome, "");
    } else {
      full.push(p.body.trim(), "");
    }
  }
}
full.push(...contact);

function write(rel, lines) {
  const text = lines.join("\n");
  const bad = text.match(/[–—]/g);
  if (bad) throw new Error(`${rel}: contains ${bad.length} em/en dash(es); fix the source data`);
  writeFileSync(join(root, rel), text, "utf8");
  console.log(`Wrote ${rel} (${text.length} chars)`);
}
write("public/llms.txt", short);
write("public/llms-full.txt", full);
