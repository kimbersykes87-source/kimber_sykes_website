# Deploy email signature assets

Hosted at **https://assets.kimbersykes.com/email-signature/** via R2 + [`workers/assets`](../workers/assets/).

## Deploy (from repo root)

```bash
npm run signature:deploy
```

This builds icon PNGs, uploads them and the HTML files to R2, and redeploys the assets worker.

Upload only (no worker deploy):

```bash
npm run signature:upload
```

## Verify

- https://assets.kimbersykes.com/email-signature/assets/icons/phone.png
- https://assets.kimbersykes.com/email-signature/signature-email.html

## Gmail

Open **signature-email.html** at the URL above (or locally) → Select all → Copy → paste into Gmail signature settings.

See [SETUP.md](SETUP.md) for Thunderbird and phone.

## Regenerate icons after SVG edits

```bash
cd email-signature
npm run build-icons
npm run signature:upload   # from repo root
```
