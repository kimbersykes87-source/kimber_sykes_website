# Email signature

HTML and icon sources for the Kimber Sykes email signature.

## Signature content (no logo)

- **Kimber Sykes** — Executive Producer  
- (UK) +44 755 367 3133 · (US) +1 323 536 2611  
- kimber@kimbersykes.com · www.kimbersykes.com · LinkedIn  
- Font: Trebuchet MS · Color: `#2b2b2b` · Icons: 16×16px (from 64×64 PNGs)

## Files

| File | Purpose |
|------|--------|
| `signature.html` | Local preview (relative image paths) |
| `signature-email.html` | Copy/paste into Gmail, Outlook, etc. (absolute URLs) |
| `signature-thunderbird.html` | Same as email version; point Thunderbird here |
| [DEPLOY.md](DEPLOY.md) | Build icons and upload to R2 + assets worker |
| [SETUP.md](SETUP.md) | Install in Gmail, Thunderbird, phone |

## Production URLs

- Icons: `https://assets.kimbersykes.com/email-signature/assets/icons/<name>.png`
- Copy/paste HTML: `https://assets.kimbersykes.com/email-signature/signature-email.html`

Deploy or update: `npm run signature:deploy` from the repo root — see **[DEPLOY.md](DEPLOY.md)**.

## Regenerate icons

```bash
cd email-signature
npm install
npm run build-icons
```

Source SVGs: `assets/icons/*.svg` (fill `#2b2b2b`).

## Optional logo

Not used in the current signature. To add later: `assets/logo.png` and an `<img>` in the HTML pointing at the same R2 base path.
