# Architecture

## Overview

```mermaid
flowchart LR
  subgraph visitors [Visitors]
    U[Browser / AI crawlers]
  end

  subgraph cloudflare [Cloudflare]
    CL[crawler-logger Worker]
    P[Pages: kimber-sykes-site]
    AF[assets Worker]
    R2[(R2: kimber-sykes-assets)]
    D1[(D1: kimber-sykes-analytics)]
    WR[weekly-report Worker]
    WA[Web Analytics beacon]
  end

  U -->|kimbersykes.com| CL
  CL -->|forward| P
  CL -->|AI bot hits| D1
  U -->|assets.kimbersykes.com/portfolio/...| AF
  AF --> R2
  P --> WA
  WR --> D1
  WR -->|Resend| Email[kimber@kimbersykes.com]
```

## Main site (Cloudflare Pages)

- **Project:** `kimber-sykes-site`
- **Build:** `npm run build` → static export in `out/`
- **Deploy:** `npm run pages:deploy` (strips files ≥25 MiB before upload)
- **Domain:** `kimbersykes.com` (and `www`)
- **Config:** [`next.config.ts`](../next.config.ts): `output: "export"`, with a custom image loader ([`lib/image-loader.ts`](../lib/image-loader.ts)) that serves pre-generated WebP variants
- **Pages Function:** [`functions/api/kimber-now.ts`](../functions/api/kimber-now.ts): `GET /api/kimber-now` for the **Where** page “Right Now” block (GPS proxy + geocoding). Env vars are set in **Pages → Settings → Environment variables** (not `NEXT_PUBLIC_*`).

Static export only: no SSR. Dynamic behaviour at the edge uses **standalone Workers** or **Pages Functions**, not `@cloudflare/next-on-pages`.

## Images and performance

- `scripts/optimize-images.mjs` (prebuild and predev) writes 640, 1280 and 1920 px WebP variants of every photo in `public/images/work` and `public/images/about` to `public/images/_opt/` (gitignored). Originals stay for Open Graph and JSON-LD.
- Case study heroes are preloaded with a responsive `imagesrcset`.
- On `/work` the first two cards load with `priority` (they are above the fold on a phone and include the LCP image); the rest are lazy. Measured live on 1 Oct 2026, throttled mobile: LCP about 2.6 to 2.8 s (was 4.1 s).
- Homepage marquee logos use `fetchPriority="low"` so they don't compete with the hero.

## Structured data and AI files

- JSON-LD `@graph` per page from `scripts/lib/schema-graph.mjs`, injected into `<head>` by `scripts/inject-json-ld-head.mjs` after the build. That script also writes `X-Robots-Tag: noindex` for the RSC `.txt` payloads into `out/_headers`.
- `llms.txt` and `llms-full.txt` are generated before the build from the `data/` files and linked from every page with `<link rel="alternate" type="text/plain">`.

## Large portfolio PDF

The portfolio PDF (~64 MiB) exceeds Cloudflare Pages’ ~25 MiB static file limit.

| Layer | Role |
|-------|------|
| [`workers/assets`](../workers/assets/) | Worker on `assets.kimbersykes.com` |
| R2 bucket `kimber-sykes-assets` | Object `portfolio/kimber-sykes-professional-portfolio-2026.pdf` |
| [`lib/downloads.ts`](../lib/downloads.ts) | About page link → assets URL in production |

CV PDF remains in the Pages bundle under `public/`.

## Crawler logging

[`workers/crawler-logger`](../workers/crawler-logger/) runs on `kimbersykes.com` and `www.kimbersykes.com`:

1. If `User-Agent` matches an AI crawler listed in [`app/robots.ts`](../app/robots.ts), insert a row into D1.
2. Forward the request to `PAGES_ORIGIN` (set to production origin, e.g. `https://kimbersykes.com`).

Does not block traffic.

## Weekly email report

[`workers/weekly-report`](../workers/weekly-report/): cron Monday 08:00 UTC:

- Aggregates D1 `crawler_visits` + `human_visits` for the past 7 days
- Sends HTML table email via Resend (`RESEND_API_KEY` secret), with week-on-week change colours

## Analytics

- **Humans:** D1 `human_visits` via crawler-logger (edge geo: country/city/region); optional Cloudflare Web Analytics beacon in [`components/CloudflareAnalytics.tsx`](../components/CloudflareAnalytics.tsx)
- **AI crawlers:** D1 `crawler_visits` via crawler-logger

## Email signature assets

HTML and icons live in [`email-signature/`](../email-signature/). Served from R2 under the `email-signature/` prefix via the same **assets Worker** (`/email-signature/*`). Deploy with `npm run signature:deploy`: see [email-signature/DEPLOY.md](../email-signature/DEPLOY.md).

## Content

All page copy and structure come from JSON in [`data/`](../data/) plus React components. No CMS. See [CONTENT.md](CONTENT.md).
