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
- **Config:** [`next.config.ts`](../next.config.ts) — `output: "export"`, unoptimized images
- **Pages Function:** [`functions/api/kimber-now.ts`](../functions/api/kimber-now.ts) — `GET /api/kimber-now` for the **Where** page “Right Now” block (GPS proxy + geocoding). Env vars are set in **Pages → Settings → Environment variables** (not `NEXT_PUBLIC_*`).

Static export only — no SSR. Dynamic behaviour at the edge uses **standalone Workers** or **Pages Functions**, not `@cloudflare/next-on-pages`.

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

[`workers/weekly-report`](../workers/weekly-report/) — cron Monday 08:00 UTC:

- Aggregates D1 `crawler_visits` + `human_visits` for the past 7 days
- Sends HTML table email via Resend (`RESEND_API_KEY` secret), with week-on-week change colours

## Analytics

- **Humans:** D1 `human_visits` via crawler-logger (edge geo: country/city/region); optional Cloudflare Web Analytics beacon in [`components/CloudflareAnalytics.tsx`](../components/CloudflareAnalytics.tsx)
- **AI crawlers:** D1 `crawler_visits` via crawler-logger

## Email signature assets

HTML and icons live in [`email-signature/`](../email-signature/). Served from R2 under the `email-signature/` prefix via the same **assets Worker** (`/email-signature/*`). Deploy with `npm run signature:deploy` — see [email-signature/DEPLOY.md](../email-signature/DEPLOY.md).

## Content

All page copy and structure come from JSON in [`data/`](../data/) plus React components. No CMS. See [CONTENT.md](CONTENT.md).
