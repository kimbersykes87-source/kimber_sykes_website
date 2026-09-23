# Kimber Sykes — portfolio site

Next.js static portfolio for **[kimbersykes.com](https://kimbersykes.com)**: work gallery, clients and agencies, world map, about, and contact. Content is JSON in `data/`.

Navigation: **What / Who / Where / Why / How** → `/work`, `/clients`, `/where`, `/about`, `/contact`.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/DEPLOY.md](docs/DEPLOY.md) | Deploy site, Workers, R2 portfolio PDF, env vars |
| [docs/CONTENT.md](docs/CONTENT.md) | Edit projects, logos, images, home page |
| [docs/LOGOS.md](docs/LOGOS.md) | Client & agency logo update guide (incl. May 2026 changelog) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Pages, Workers, D1, analytics |
| [docs/brief.md](docs/brief.md) | Original product brief |
| [email-signature/README.md](email-signature/README.md) | Email signature HTML and icons |

## Requirements

- Node.js 20+
- npm
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (`npx wrangler login`) for deploy

## Commands

| Command | Purpose |
|--------|---------|
| `npm run dev` | Local dev (Turbopack) |
| `npm run build` | Static export → `out/` |
| `npm run lint` | ESLint |
| `npm run sync:logos` | Sync client logos into `public/images/logos/clients/` |
| `npm run sync:agency-logos` | Sync agency logos |
| `npm run build:agency-raster-svgs` | Embed raster agency artwork as SVG |
| `npm run strip:pages` | Remove files ≥25 MiB from `out/` before Pages upload |
| `npm run pages:deploy` | Build, strip, deploy to Cloudflare Pages |
| `npm run portfolio:upload` | Upload portfolio PDF to R2 |
| `npm run signature:deploy` | Build email-signature icons, upload to R2, deploy assets worker |
| `npm run assets:deploy` | Deploy `workers/assets` on `assets.kimbersykes.com` |

## Environment

See [`.env.example`](.env.example). Set `NEXT_PUBLIC_*` in Cloudflare Pages for production builds. Pages runtime vars (`KIMBER_GPS_*`) power `/api/kimber-now` on the **Where** page.

## Deploy (production)

```bash
npm run pages:deploy
```

Portfolio PDF and worker setup: [docs/DEPLOY.md](docs/DEPLOY.md).

## Repo structure

```
app/          Pages (App Router)
components/   UI
data/         JSON content
public/       Images and PDFs
workers/      Cloudflare Workers
functions/    Pages Functions (kimber-now API)
scripts/      Build and logo tooling
docs/         Project documentation
email-signature/  Email signature (separate from main site deploy)
resources/    Logo sources for scripts (not deployed)
```
