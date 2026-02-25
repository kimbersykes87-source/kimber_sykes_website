# Email signature

Assets and HTML for the Kimber Sykes email signature, hosted at **assets.kimbersykes.com**.

## Current signature (no logo)

- Name: Kimber Sykes  
- Title: Executive Producer  
- (UK) +44 755 367 3133 · (US) +1 323 536 2611  
- kimber@kimbersykes.com · www.kimbersykes.com · LinkedIn  
- Font: Trebuchet MS · Color: #2b2b2b · Icons: 16×16px (64×64 source PNGs)

## Where assets are hosted

After deployment, assets are served from:

- **Base:** `https://assets.kimbersykes.com/email-signature/`
- **Icons:** `https://assets.kimbersykes.com/email-signature/assets/icons/` (phone.png, email.png, web.png, linkedin.png)
- **Logo (optional):** `https://assets.kimbersykes.com/email-signature/assets/logo.png` — not used in current signature; kept for future use.

**Important:** Image URLs in the signature use the path `.../email-signature/assets/...` (repo structure is `email-signature/assets/`), so the live URLs must include `assets/` after `email-signature/`.

## Files in this folder

| File | Purpose |
|------|--------|
| `signature.html` | Local preview; relative paths so images load from disk. |
| `signature-email.html` | Copy/paste into Gmail, Outlook, etc.; absolute URLs for sent emails. |
| `signature-thunderbird.html` | Same content as `signature-email.html`; use as “signature from file” in Thunderbird. |

## Deploying to Cloudflare

See **[../DEPLOY.md](../DEPLOY.md)** for full steps. Summary:

1. Repo: **kimber_sykes_website** (GitHub: kimbersykes87-source/kimber_sykes_website).  
2. Cloudflare Pages: connect repo, Framework **None**, Build command empty, Output **/** , Root directory **empty**.  
3. Custom domain: **assets.kimbersykes.com** (CNAME to `<project>.pages.dev`).  
4. After deploy, verify: `https://assets.kimbersykes.com/email-signature/assets/icons/phone.png` loads.

## Installing the signature in email clients

See **[../SETUP.md](../SETUP.md)** for Gmail (web), Thunderbird, and phone.

### Thunderbird (quick reference)

- **Signature file:** Use `signature-thunderbird.html`. Copy to a stable path (e.g. `C:\Users\<you>\Dropbox\...\LOGO\signature-thunderbird.html`) and point Thunderbird to it: Account Settings → Default Identity → **Attach the signature from a file** → Choose that file.  
- **Required:** Check **“Use HTML”** in the signature section so icons and links render; otherwise you’ll see broken image placeholders.

## Icons (PNG)

Icons are 64×64 PNGs (displayed at 16×16 in the signature). Source SVGs are in `assets/icons/` (fill/stroke #2b2b2b). To regenerate PNGs after editing SVGs:

```bash
npm run build-icons
```

## Logo (optional)

Logo is not used in the current signature. To use it again: add an `<img>` in the HTML pointing to `https://assets.kimbersykes.com/email-signature/assets/logo.png`. Logo file: `assets/logo.png` (e.g. export from `Email_Sig_2026.ai` in your LOGO folder).
