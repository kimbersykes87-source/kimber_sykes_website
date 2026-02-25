# Get the email signature online: GitHub + Cloudflare Pages

Steps to host the signature at **assets.kimbersykes.com** with auto-deploy from GitHub.

---

## 1. GitHub: create repo and push (CLI)

Install the [GitHub CLI](https://cli.github.com/) (`gh`) if needed, then:

```powershell
cd c:\dev\KS_Website

# One-time: init and ignore node_modules
git init
# (.gitignore with node_modules/ already exists)

git add .
git commit -m "Initial commit: email signature and assets"

# Create the repo on GitHub and push (replace with your GitHub username if needed)
gh repo create KS_Website --public --source=. --push
```

Use a different repo name if you prefer (e.g. `ks-email-signature`). The repo must contain the **email-signature** folder at the top level so that after deploy the URL path is `.../email-signature/logo.png`, etc.

---

## 2. Cloudflare: create the **assets.kimbersykes.com** Pages site

1. **Open Cloudflare**  
   Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages**.

2. **Create a Pages project from Git**  
   - Click **Create application** → **Pages** → **Connect to Git**.  
   - Sign in with **GitHub** and authorize Cloudflare.  
   - Select the repo you just pushed (e.g. **KS_Website**).

3. **Configure the build**  
   - **Project name:** e.g. `ks-email-signature` or `assets-kimbersykes`.  
   - **Production branch:** `main` (or your default branch).  
   - **Build settings:**  
     - **Framework preset:** None  
     - **Build command:** leave empty  
     - **Build output directory:** `/` (or leave default)  
   - **Root directory:** leave **empty**.  
     The repo root is the site root, so `email-signature/` is served at `https://assets.kimbersykes.com/email-signature/`.

4. **Deploy**  
   Click **Save and Deploy**. Wait for the first build. The site will be at `https://<project-name>.pages.dev`.

---

## 3. Cloudflare: add custom domain **assets.kimbersykes.com**

1. In your **Pages** project, open **Custom domains**.  
2. Click **Set up a custom domain** (or **Add custom domain**).  
3. Enter **assets.kimbersykes.com** and continue.

4. **If kimbersykes.com is already on Cloudflare (same account):**  
   Cloudflare can add the CNAME for you. Follow the prompts to confirm.

5. **If kimbersykes.com is not on Cloudflare** (e.g. DNS at Adobe, GoDaddy, etc.):  
   - Cloudflare will show a **CNAME** to add at your DNS provider, for example:  
     - **Name/host:** `assets`  
     - **Target/value:** `<your-project>.pages.dev` (e.g. `ks-email-signature.pages.dev`)  
   - Add that CNAME where kimbersykes.com’s DNS is managed.  
   - Back in Cloudflare, complete the domain setup (e.g. **Activate** / **Verify**).

After DNS propagates (usually a few minutes, sometimes up to 24 hours), the site will be live at **https://assets.kimbersykes.com**.

---

## 4. Verify the signature assets

Open in a browser:

- `https://assets.kimbersykes.com/email-signature/logo.png`  
- `https://assets.kimbersykes.com/email-signature/icons/phone.png`  

If these load, the email signature (using `signature-email.html`) will work in sent emails.

---

## Auto-deploy

Every push to the connected branch (e.g. `main`) will trigger a new Cloudflare Pages deployment. No extra config needed.
