# Content guide

All structured content is JSON under [`data/`](../data/). Images live under [`public/images/`](../public/images/).

## Data files

| File | Purpose |
|------|---------|
| [`data/projects.json`](../data/projects.json) | Case studies. **Array order = work gallery order** (curated, not chronological). |
| [`data/featured.json`](../data/featured.json) | Slugs for the home “Featured work” grid (3–4 items). |
| [`data/clients.json`](../data/clients.json) | Client logos; order = **Who** page grid. Optional `displayScale`. |
| [`data/agencies.json`](../data/agencies.json) | Agency logos; order = **Who** agency section + home agency marquee. |
| [`data/map.json`](../data/map.json) | Map pins and copy for **Where**. |

## Home page section order

1. Hero and CTA  
2. By the numbers  
3. **Brands** — [`components/LogoMarquee.tsx`](../components/LogoMarquee.tsx) (all clients via `getMarqueeClients()` in `lib/marquee.ts`: featured + refreshed logos first)  
4. **Agency partners** — [`components/AgencyMarquee.tsx`](../components/AgencyMarquee.tsx) (follows `agencies.json`)  
5. **Featured work** — from `featured.json`  
6. Availability line  

## Navigation

Labels: **What / Who / Where / Why / How** → `/work`, `/clients`, `/where`, `/about`, `/contact`.

## Adding or editing a project

1. Add or edit an entry in `data/projects.json` (`slug`, title, client, role, year, body, tags, etc.).
2. Create `public/images/work/<slug>/`:
   - `hero.jpg` — gallery card and project header (≈1920×1080, JPG, compress)
   - `01.jpg`, `02.jpg`, … — gallery images (≈1200×800)
3. Rebuild and deploy: `npm run pages:deploy`.

## Client and agency logos

Full step-by-step guide: **[LOGOS.md](LOGOS.md)** (sources, sync commands, JSON, marquee, map aliases, checklist).

**Recent (24 May 2026):** Refreshed client masters (Aperol, Emirates, Google Cloud, Mastercard, J&J, Peugeot, Rizla, Stella McCartney, Tiger, etc.); removed clients `scottish-water` and `telstra`; removed agency `dae`. See [LOGOS.md § Changelog](LOGOS.md#changelog-24-may-2026). **46** clients, **17** agencies.

Home “Global Brands” count = number of entries in `clients.json` (`lib/marquee.ts`). “Countries” = `mapCountries.length` from `data/map.json`.

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

- Portrait: `public/images/about/portrait.jpg`
- CV: `public/Kimber Sykes - CV - 2026.pdf` (bundled on Pages)
- Portfolio PDF: served from R2 (not in Pages bundle) — see [DEPLOY.md](DEPLOY.md)

## SEO

- [`app/robots.ts`](../app/robots.ts) — allows `/` for humans and named AI crawlers
- [`app/sitemap.ts`](../app/sitemap.ts) — static routes + all `/work/[slug]` URLs

## Product brief

Full original spec: [brief.md](brief.md).
