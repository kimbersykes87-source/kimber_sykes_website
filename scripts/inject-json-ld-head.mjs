/**
 * Post-build: inject JSON-LD <script> tags into <head> only (static export).
 * Avoids React/RSC body duplicates. Homepage: Person + WebSite + ProfessionalService.
 * Case studies: CreativeWork per /work/[slug].
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "out");
const site = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://kimbersykes.com"
).replace(/\/$/, "");

const LINKEDIN_URL = "https://uk.linkedin.com/in/kimber-sykes-33400326";
const JOB_TITLES =
  "Freelance Executive Producer, Production Manager and Technical Director";
const PERSON_DESCRIPTION =
  "Freelance Executive Producer, Production Manager and Technical Director specialising in B2B tech conferences, consumer brand activations, and major sports sponsorship programmes. 23 years experience. Based in London, available worldwide.";

function excerptFirstSentence(body) {
  const sentences = body.trim().split(/(?<=[.!?])\s+/);
  const first = sentences[0]?.trim();
  if (first && first.length >= 40) return first.endsWith(".") ? first : `${first}.`;
  return body.trim().slice(0, 160);
}

function buildHomePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Kimber Sykes",
    gender: "Male",
    jobTitle: JOB_TITLES,
    description: PERSON_DESCRIPTION,
    url: site,
    image: `${site}/images/about/portrait.jpg`,
    sameAs: [LINKEDIN_URL],
    address: {
      "@type": "PostalAddress",
      addressLocality: "London",
      addressCountry: "UK",
    },
    knowsAbout: [
      "Executive Production",
      "Event Production Management",
      "Technical Direction",
      "B2B Conferences",
      "Consumer Brand Activations",
      "Experiential Marketing",
      "Sports Sponsorship Activations",
      "Live Event Production",
      "AV Technical Delivery",
      "Show Flow",
      "Exhibition Floor Management",
      "Touring Global Programmes",
    ],
    workLocation: { "@type": "Place", name: "Worldwide" },
  };
}

function buildHomeWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kimber Sykes",
    url: site,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site}/work?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function buildHomeProfessionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Kimber Sykes",
    description: PERSON_DESCRIPTION,
    url: site,
    image: `${site}/images/about/portrait.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "London",
      addressCountry: "UK",
    },
    areaServed: "Worldwide",
  };
}

function buildCreativeWorkSchema(project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${project.client}: ${project.project}`,
    creator: {
      "@type": "Person",
      name: "Kimber Sykes",
      jobTitle: project.role,
    },
    about: excerptFirstSentence(project.body),
    dateCreated: String(project.year),
    locationCreated: { "@type": "Place", name: project.location },
    publisher: { "@type": "Organization", name: project.agency },
    sponsor: { "@type": "Organization", name: project.client },
  };
}

function safeJsonLdStringify(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function scriptsHtml(schemas) {
  return schemas
    .map(
      (schema) =>
        `<script type="application/ld+json">${safeJsonLdStringify(schema)}</script>`,
    )
    .join("");
}

function stripJsonLd(html) {
  return html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    "",
  );
}

function injectSchemas(html, schemas) {
  if (!schemas.length) return html;
  const cleaned = stripJsonLd(html);
  const block = scriptsHtml(schemas);
  if (!cleaned.includes("</head>")) {
    throw new Error("No </head> found in HTML");
  }
  return cleaned.replace("</head>", `${block}</head>`);
}

function htmlFileToRoute(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"/index.html".length)}`;
  }
  if (normalized.endsWith(".html")) {
    return `/${normalized.slice(0, -".html".length)}`;
  }
  return null;
}

function walkHtmlFiles(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walkHtmlFiles(full, files);
    } else if (name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function buildRouteSchemas() {
  const projects = JSON.parse(
    fs.readFileSync(path.join(root, "data", "projects.json"), "utf8"),
  );
  const routes = new Map();
  routes.set("/", [
    buildHomePersonSchema(),
    buildHomeWebSiteSchema(),
    buildHomeProfessionalServiceSchema(),
  ]);
  for (const project of projects) {
    routes.set(`/work/${project.slug}`, [buildCreativeWorkSchema(project)]);
  }
  return routes;
}

function main() {
  if (!fs.existsSync(outDir)) {
    console.error("inject-json-ld-head: out/ not found — run next build first");
    process.exit(1);
  }

  const routeSchemas = buildRouteSchemas();
  const htmlFiles = walkHtmlFiles(outDir);
  let injected = 0;

  for (const file of htmlFiles) {
    const rel = path.relative(outDir, file);
    const route = htmlFileToRoute(rel);
    if (!route) continue;

    const schemas = routeSchemas.get(route);
    if (!schemas) continue;

    const html = fs.readFileSync(file, "utf8");
    const next = injectSchemas(html, schemas);
    fs.writeFileSync(file, next, "utf8");
    injected++;
    console.log(`json-ld: ${route} → ${schemas.length} schema(s) in <head>`);
  }

  console.log(`inject-json-ld-head: updated ${injected} HTML file(s)`);
}

main();
