# AGENTS.md

## Cursor Cloud specific instructions

This is a static email signature project (no backend, no database, no running services). All project files live in `email-signature/`.

### Services

| Service | Purpose | How to run |
|---------|---------|-----------|
| Icon build | Regenerates 64×64 PNGs from SVGs (only needed when SVGs change) | `cd email-signature && npm run build-icons` |
| Local preview | Serves `signature.html` with working relative image paths | `cd email-signature && npx http-server . -p 8080 -c-1` |

### Key notes

- There is no lint, test framework, or CI pipeline configured in this repo. The only "build" step is `npm run build-icons`.
- The generated `.png` files in `email-signature/assets/icons/` are **not** committed to git (listed in `.gitignore` under `node_modules/`). They must be regenerated via `npm run build-icons` after cloning.
- `signature.html` uses relative paths for local preview; `signature-email.html` uses absolute `https://assets.kimbersykes.com/...` URLs for production email clients.
- Deployment is automatic via Cloudflare Pages on push to `master`.
- See `email-signature/README.md` for full project documentation.
