# Email signature

Assets and HTML for the Kimber Sykes email signature, hosted at **assets.kimbersykes.com**.

## Where assets are hosted

After deployment, assets are served from:

- **Base**: `https://assets.kimbersykes.com/email-signature/`
- **Logo**: `https://assets.kimbersykes.com/email-signature/assets/logo.png`
- **Icons**: `https://assets.kimbersykes.com/email-signature/assets/icons/` (phone.png, email.png, web.png, linkedin.png)

## Deploying to Cloudflare

1. Connect this repo (or the `email-signature` folder) to **Cloudflare Pages**.
2. Set the build output to the directory that contains `signature.html` and the `assets` folder (e.g. project root if the whole site is this folder, or `email-signature` if the repo root is `KS_Website`).
3. In Cloudflare DNS, add a **CNAME** record: `assets` → your Cloudflare Pages URL (e.g. `your-project.pages.dev`).
4. Ensure `https://assets.kimbersykes.com/email-signature/assets/logo.png` and `https://assets.kimbersykes.com/email-signature/assets/icons/*.png` are reachable after deploy.

## Logo (before first deploy)

The signature uses a **PNG** logo for email client compatibility. Use the PNG export of `Email_Sig_2026.ai` from your LOGO folder:

- If you already have a PNG (e.g. exported from the .ai), copy it to `assets/logo.png` in this folder.
- Otherwise: open `Email_Sig_2026.ai` in Illustrator → **File → Export → Export As** → format **PNG**, height ~80–120px (e.g. 100px), transparent or white background → save as `assets/logo.png`.

## Icons (PNG)

Email clients often don’t support SVG images, so the signature uses **PNG** icons (16×16px). The repo includes both the source SVGs (in `assets/icons/`, with fill/stroke #2b2b2b) and the generated PNGs. To regenerate the PNGs after editing the SVGs, run:

```bash
npm run build-icons
```

## How to use the signature

**Preview locally:** Open `signature.html` in a browser. It uses relative image paths so the logo and icons load from your machine.

**Use in email (after deploying):**
1. Deploy this folder so the assets are live at `https://assets.kimbersykes.com/email-signature/`.
2. Open `signature-email.html` in a browser (images will load only after deploy).
3. Select all (Ctrl+A / Cmd+A), then copy (Ctrl+C / Cmd+C).
4. Paste into your email client’s signature settings (e.g. Gmail → Settings → Signature; Outlook → File → Options → Mail → Signatures).

`signature-email.html` uses absolute image URLs so the signature displays correctly in sent emails.
