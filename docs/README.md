# Documentation

Production site: **[kimbersykes.com](https://kimbersykes.com)** — static Next.js on Cloudflare Pages, with Workers for large assets, crawler logging, and weekly reports.

| Guide | What it covers |
|-------|----------------|
| [DEPLOY.md](DEPLOY.md) | Deploy and update the site, R2 portfolio PDF, Workers, env vars, GPS API |
| [CONTENT.md](CONTENT.md) | JSON data, images, logos, home page marquees |
| [LOGOS.md](LOGOS.md) | Client & agency logos (see **Changelog, 24 May 2026**) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How Pages, Workers, R2, D1, and Pages Functions fit together |
| [brief.md](brief.md) | Original product brief (reference) |

## Repo layout

```
app/              Next.js App Router pages
components/       React UI
data/             JSON content (projects, clients, agencies, map, featured)
public/           Static images, CV PDF, local-only portfolio PDF
scripts/          Logo sync, Pages strip, one-off ingest helpers
workers/          Cloudflare Workers (assets, crawler-logger, weekly-report)
functions/        Cloudflare Pages Functions (/api/kimber-now)
email-signature/  HTML signature + icon build (see email-signature/README.md)
resources/        Logo source files for sync scripts (not deployed)
```

## Quick commands

```bash
npm run dev              # local dev
npm run build            # static export → out/
npm run pages:deploy     # build, strip oversized files, deploy to Pages
npm run portfolio:upload # upload portfolio PDF to R2
npm run assets:deploy    # deploy assets.kimbersykes.com worker
```

See the root [README.md](../README.md) for the full command list and environment variables.
