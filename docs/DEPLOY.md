# Deployment

**Live site:** [https://kimbersykes.com](https://kimbersykes.com)

## Prerequisites

- Node.js 20+
- `npm install`
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged in: `npx wrangler login`
- Cloudflare account with zone **kimbersykes.com**

## Environment variables

Copy [`.env.example`](../.env.example) to `.env.local` for local builds. For production, set the same `NEXT_PUBLIC_*` values in **Cloudflare Pages → kimber-sykes-site → Settings → Environment variables**.

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SITE_URL` | Pages build | Canonical URL (`https://kimbersykes.com`) — sitemap, robots, JSON-LD |
| `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | Pages build | Cloudflare Web Analytics beacon |
| `NEXT_PUBLIC_PORTFOLIO_PDF_URL` | Pages build | Optional; defaults to assets worker URL when site URL is kimbersykes.com |
| `KIMBER_GPS_WORKER_URL` | Pages **runtime** | `/api/kimber-now` GPS worker |
| `KIMBER_GPS_USER_ID` | Pages runtime | Device id for GPS API |
| `KIMBER_GPS_API_KEY` | Pages runtime | Optional API key |

Worker secrets (not in Pages):

```bash
npx wrangler secret put RESEND_API_KEY --config workers/weekly-report/wrangler.toml
# optional manual trigger:
npx wrangler secret put MANUAL_TRIGGER_SECRET --config workers/weekly-report/wrangler.toml
```

## Deploy the main site

From the repo root:

```bash
npm run pages:deploy
```

This runs `next build`, removes static files ≥25 MiB from `out/` ([`scripts/strip-out-oversize-for-pages.mjs`](../scripts/strip-out-oversize-for-pages.mjs)), then `wrangler pages deploy out --project-name=kimber-sykes-site`.

**Preview URLs** (`*.pages.dev`) send `X-Robots-Tag: noindex`. Test SEO and Lighthouse on the **custom domain**.

## Portfolio PDF (one-time / when PDF changes)

```bash
npx wrangler r2 bucket create kimber-sykes-assets   # first time only
npm run portfolio:upload
npm run assets:deploy
```

Public URL: `https://assets.kimbersykes.com/portfolio/kimber-sykes-professional-portfolio-2026.pdf`

## Email signature (Gmail icons + hosted HTML)

```bash
npm run signature:deploy
```

Builds PNGs from SVG, uploads to R2 under `email-signature/`, redeploys the assets worker. Verify:

- `https://assets.kimbersykes.com/email-signature/assets/icons/phone.png`
- `https://assets.kimbersykes.com/email-signature/signature-email.html`

Requires `npx wrangler login` (or `CLOUDFLARE_API_TOKEN`).

## Workers

Deploy each worker from the repo root:

```bash
npm run assets:deploy
npx wrangler deploy --config workers/crawler-logger/wrangler.toml
npx wrangler deploy --config workers/weekly-report/wrangler.toml
```

### crawler-logger

- Routes: `kimbersykes.com/*`, `www.kimbersykes.com/*`
- Set `PAGES_ORIGIN` to your **Pages `*.pages.dev` hostname** (e.g. `https://kimber-sykes-site.pages.dev`), **not** `kimbersykes.com` — the worker already runs on the custom domain; forwarding to the same host would loop.

### D1 schema

```bash
npx wrangler d1 execute kimber-sykes-analytics --remote --file=workers/crawler-logger/schema.sql
```

If you recreate the database, update `database_id` in both worker `wrangler.toml` files.

### weekly-report

- Cron: Monday 08:00 UTC
- HTML email: AI vs human summary (pastel green/red week-on-week), ranked bots, human country/city from edge geo
- After pulling schema changes, re-run D1 migrate (adds `human_visits`):  
  `npx wrangler d1 execute kimber-sykes-analytics --remote --file=workers/crawler-logger/schema.sql`
- Redeploy **crawler-logger** (logs humans) and **weekly-report** (sends HTML)
- Verify **kimbersykes.com** in Resend for `REPORT_FROM_EMAIL` / `REPORT_TO_EMAIL`
- Manual test: `POST` to the worker `/trigger` with header `x-weekly-report-key` after setting `MANUAL_TRIGGER_SECRET`

## Verify after deploy

1. [https://kimbersykes.com](https://kimbersykes.com) loads
2. `/work`, `/about`, `/where` — spot-check
3. About page portfolio link opens the PDF on `assets.kimbersykes.com`
4. `/api/kimber-now` returns JSON (Where page “Right Now”)
5. Web Analytics shows pageviews after browsing the live site

## Lighthouse (optional)

```bash
npx lighthouse@12 https://kimbersykes.com/ --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new"
```

Run against the **production domain**, not `*.pages.dev` (preview sends `noindex` and lowers SEO score).

## What we do not use

**`@cloudflare/next-on-pages`** — not needed. The site is a static export; edge logic lives in `workers/` and `functions/`.
