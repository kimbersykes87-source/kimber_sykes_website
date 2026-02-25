# Deploy email signature: GitHub + Cloudflare Pages

Host the signature at **assets.kimbersykes.com** with auto-deploy from GitHub.

---

## Current setup (for reference)

- **GitHub repo:** [kimbersykes87-source/kimber_sykes_website](https://github.com/kimbersykes87-source/kimber_sykes_website)
- **Branch:** `master`
- **Cloudflare Pages project:** e.g. `kimber-sykes-website` (custom domain: assets.kimbersykes.com)
- **Site structure:** Repo root = site root. The folder `email-signature/` is at the URL path `/email-signature/`, and assets live at `/email-signature/assets/` (e.g. `.../email-signature/assets/icons/phone.png`).

---

## 1. GitHub: repo and push (CLI)

```powershell
cd c:\dev\KS_Website

git add .
git commit -m "Your message"
git push
```

Repo already exists; push to `master` triggers Cloudflare deploy.

**First-time setup on a new machine:** clone then push as needed:

```powershell
gh repo clone kimbersykes87-source/kimber_sykes_website c:\dev\KS_Website
cd c:\dev\KS_Website
# edit files, then:
git add .
git commit -m "Initial or update"
git push
```

---

## 2. Cloudflare Pages (one-time)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**.
2. **Create application** → **Pages** → **Connect to Git** → **GitHub** → select **kimber_sykes_website**.
3. **Build settings:**
   - **Framework preset:** None  
   - **Build command:** (empty)  
   - **Build output directory:** `/`  
   - **Root directory:** (empty)
4. **Save and Deploy.** Note the `*.pages.dev` URL.

---

## 3. Custom domain: assets.kimbersykes.com

1. In the Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter **assets.kimbersykes.com**.
3. If **kimbersykes.com** is on Cloudflare: CNAME is created for you.
4. If not: add at your DNS provider: **CNAME** `assets` → `<project-name>.pages.dev`.

---

## 4. Verify after deploy

Open:

- `https://assets.kimbersykes.com/email-signature/assets/icons/phone.png`
- `https://assets.kimbersykes.com/email-signature/signature-email.html` (optional; copy from here for Gmail/Outlook)

If these load, the signature will work in sent emails.

---

## Auto-deploy

Every push to **master** triggers a new Cloudflare Pages deployment. No extra config.
