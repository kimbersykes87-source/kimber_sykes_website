# Content guide

All structured content is JSON under [`data/`](../data/). Images live under [`public/images/`](../public/images/).

## Data files

| File | Purpose |
|------|---------|
| [`data/projects.json`](../data/projects.json) | Case studies. **Array order = work gallery order** (curated, not chronological). |
| [`data/featured.json`](../data/featured.json) | Slugs for the home “Featured work” grid (3 to 4 items). |
| [`data/clients.json`](../data/clients.json) | Client logos; order = **Who** page grid. Optional `displayScale`. |
| [`data/agencies.json`](../data/agencies.json) | Agency logos; order = **Who** agency section + home agency marquee. |
| [`data/map.json`](../data/map.json) | Map pins and copy for **Where**. |

## Home page section order

1. Hero and CTA  
2. By the numbers  
3. **Brands**: [`components/LogoMarquee.tsx`](../components/LogoMarquee.tsx) (all clients via `getMarqueeClients()` in `lib/marquee.ts`: featured + refreshed logos first)  
4. **Agency partners**: [`components/AgencyMarquee.tsx`](../components/AgencyMarquee.tsx) (follows `agencies.json`)  
5. **Featured work**: from `featured.json`  
6. Availability line  

## Navigation

Labels: **What / Who / Where / Why / How** → `/work`, `/clients`, `/where`, `/about`, `/contact`.

## Adding or editing a project

1. Add or edit an entry in `data/projects.json`. Fields:
   - `slug` (URL, never change once live), `client`, `agency`, `role`, `year`, `location`, `sector` (`B2B Tech`, `Consumer`, `Sports`), `heroImage`, `gallery`, `updated` (YYYY-MM-DD, feeds `dateModified` and the sitemap).
   - `project`: the display name used in the browser title, H1, `/work` tile, breadcrumbs, schema and llms files. **It must contain the client name** (e.g. "Aperol Spritz at the Australian Open 2024"), so the client is in the title. Tiles and captions hide the separate client line when the project name already includes it.
   - `role`: the credit, **exactly as Kimber gives it**. Never reword it.
   - `summary`: one answer-first sentence, 160 characters or fewer, starting with the credit, e.g. "Executive Producer for INVNT on ...". It is also the meta description and schema `description`.
   - `brief`, `scale` (list), `responsibilities` (list), `highlights` (list), `outcome` (string): the case study sections. A section only renders when it has content. Use only facts Kimber has confirmed or sourced facts he has approved; put measured results (visitors, reach, awards) in `outcome`.
   - `body`: legacy text, kept for the `/work?q=` filter and as a fallback.
2. If the project appears on the Where map, use the same `project` name in `data/map.json`.
3. Create `public/images/work/<slug>/`:
   - `hero.jpg`: gallery card and project header (≈1920×1080, JPG, compress)
   - `01.jpg`, `02.jpg`, …: gallery images (≈1200×800)
4. Rebuild and deploy: `npm run pages:deploy`. The prebuild step regenerates WebP variants, `public/llms.txt` and `public/llms-full.txt`; the postbuild step injects JSON-LD.

Writing rules for all site copy: British English, no em or en dashes (the llms generator fails the build if it finds one), no pricing, rates, booking length, lead times or FAQ.

## Client and agency logos

Full step-by-step guide: **[LOGOS.md](LOGOS.md)** (sources, sync commands, JSON, marquee, map aliases, checklist).

**Recent (24 May 2026):** Refreshed client masters (Aperol, Emirates, Google Cloud, Mastercard, J&J, Peugeot, Rizla, Stella McCartney, Tiger, etc.); removed clients `scottish-water` and `telstra`; removed agency `dae`. See [LOGOS.md § Changelog](LOGOS.md#changelog-24-may-2026). **46** clients, **17** agencies.

**Current counts (1 Oct 2026):** 47 clients in `clients.json`, 18 agencies in `agencies.json`.

Home “Clients” stat = entries in `clients.json` plus `CLIENTS_WITHOUT_LOGO` in `lib/marquee.ts` (currently Arise Fashion), so 48. “Countries” = `mapCountries.length` from `data/map.json`.

Quick reference:

- **Deployed paths:** `public/images/logos/clients/` and `public/images/logos/agencies/`
- **Sources:** `resources/logo-sources/` and archived EPS/AI under `public/images/logos/clients/_archive/`

```bash
npm run sync:logos              # client marks from Simple Icons + sources
npm run sync:agency-logos       # agency marks
npm run build:agency-raster-svgs  # raster agency artwork → SVG
```

Update `data/clients.json` / `data/agencies.json` when adding a new logo file.

## About page assets

- Portrait: `public/images/about/portrait.jpg` (tracked in git since 1 Oct 2026; the `.gitignore` entry is `/portrait.jpg`, root only). Also used as the default `og:image` and the schema `#portrait`.
- CV: `public/Kimber Sykes - CV - 2026.pdf` (bundled on Pages)
- Portfolio PDF: served from R2 (not in Pages bundle): see [DEPLOY.md](DEPLOY.md)

## SEO and AI answer engines

- [`app/robots.ts`](../app/robots.ts): allows `/` for humans and named AI crawlers (list in `lib/ai-crawlers.ts`).
- [`app/sitemap.ts`](../app/sitemap.ts): static routes plus all `/work/[slug]` URLs; `lastmod` from the last git commit touching each page's sources.
- Identity (name, roles, one-liner, services, career) lives in `data/site.json`. Use the one-liner word for word.
- JSON-LD: one `@graph` per page from [`scripts/lib/schema-graph.mjs`](../scripts/lib/schema-graph.mjs), injected post-build. Credits use a `Role` node pointing at `#person`.
- `public/llms.txt` and `public/llms-full.txt` are generated by [`scripts/generate-llms-txt.mjs`](../scripts/generate-llms-txt.mjs); edit the data, not these files.
- Legacy URL redirects are in `public/_redirects`.
- Audits and change logs: [`site-audit.md`](../site-audit.md) and [`site-audit-2.md`](../site-audit-2.md).

## Product brief

Full original spec: [brief.md](brief.md).
