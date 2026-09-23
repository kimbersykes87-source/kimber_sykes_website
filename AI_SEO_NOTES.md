# AI SEO audit notes — kimbersykes.com

Last updated: May 2026

## Critical: Cloudflare blocks AI crawlers (403) — hosting fix required

**Symptom:** `curl -A "ClaudeBot/1.0" https://kimbersykes.com/` returns **HTTP 403** with body `Your request was blocked.` Browser user-agents return **200**.

**Repo finding:** No application code, middleware, `_headers`, or Worker returns 403 by user-agent. The `workers/crawler-logger` worker only logs AI hits and forwards to the Pages origin; it does not block.

**Likely cause:** Cloudflare **Bot Fight Mode**, **Super Bot Fight Mode**, or a **WAF custom rule** on the `kimbersykes.com` zone blocking non-browser / automated clients before they reach your Worker or Pages project.

**Evidence:** The same site on `https://kimber-sykes-site.pages.dev/` returns **200** for `ClaudeBot`, so static HTML is fine once Cloudflare security allows the request.

### What to do in Cloudflare Dashboard

1. **Security → Settings**
   - Review **Security Level** (try *Essentially Off* temporarily to confirm, then tune back).
   - Under **Bots**, check **Bot Fight Mode** and **Super Bot Fight Mode** — disable or set to allow verified bots if AI crawlers must read HTML on the custom domain.

2. **Security → WAF → Custom rules**
   - Look for rules that block by User-Agent, ASN, or “likely automated”.
   - Add a **Skip** rule (higher priority) for known AI crawlers, e.g. expression:
     ```
     (http.user_agent contains "GPTBot") or
     (http.user_agent contains "ClaudeBot") or
     (http.user_agent contains "PerplexityBot") or
     (http.user_agent contains "Google-Extended") or
     (http.user_agent contains "OAI-SearchBot") or
     (http.user_agent contains "anthropic-ai")
     ```
   - Action: **Skip** → select Bot Fight Mode, Super Bot Fight Mode, and relevant managed rulesets.

3. **Security → Bots**
   - Enable **Allow verified bots** where available.
   - Under **AI Crawlers** (if shown on your plan), allow indexing/crawling for training/search bots you want.

4. **Rules → Configuration Rules** (or Page Rules)
   - Ensure nothing on `kimbersykes.com/*` returns challenge/block for bots.

5. **Workers & Pages → kimber-sykes-crawler-logger**
   - Confirm routes: `kimbersykes.com/*`, `www.kimbersykes.com/*`.
   - Confirm `PAGES_ORIGIN` is `https://kimber-sykes-site.pages.dev` (not the custom domain).

### Verify after change

```powershell
curl.exe -sI -A "ClaudeBot/1.0" https://kimbersykes.com/
curl.exe -s -A "ClaudeBot/1.0" https://kimbersykes.com/ | findstr /i "Freelance Executive Producer"
```

Expect **HTTP/1.1 200** and the homepage H1 text in the HTML body.

---

## Code changes made in this audit

| Area | Files |
|------|--------|
| SEO helpers | `lib/seo.ts` — canonical, Open Graph, Twitter, absolute titles |
| LinkedIn + company | `lib/contact.ts` — `LINKEDIN_URL`, `COMPANY_NAME` |
| JSON-LD | `lib/json-ld.ts` — `Person`, `ProfessionalService`, `CreativeWork` (creator, client via `about`) |
| AI crawlers list | `lib/ai-crawlers.ts` — added `Perplexity-User` |
| Homepage | `app/page.tsx` — H1 “Freelance Executive Producer”, tagline demoted, “About / Hire me” block, schemas |
| Case studies | `app/work/[slug]/page.tsx` — H1 `Client — Project`, metadata, improved alts |
| Metadata | `app/layout.tsx`, `app/work/page.tsx`, `app/about/page.tsx`, `app/clients/page.tsx`, `app/where/page.tsx`, `app/contact/page.tsx` |
| llms.txt | `scripts/generate-llms-txt.mjs`, `lib/llms-txt.ts` — Services / Case studies / Contact template |
| Alt text | `components/ProjectCard.tsx`, case study hero/gallery helpers |
| robots / sitemap | Unchanged paths — still `app/robots.ts` + `app/sitemap.ts` at build time |

**Canonical URL:** `https://kimbersykes.com` (apex). Sitemap and robots use `getSiteUrl()`.

**Rendering:** Static export (`output: "export"`) — all public pages are pre-rendered HTML; no client-only homepage content.

---

## Post-deploy checklist

- [ ] Fix Cloudflare 403 for bot user-agents (see above).
- [ ] Deploy: `npm run pages:deploy` (runs `generate:llms` + `next build` + Pages deploy).
- [ ] Confirm `https://kimbersykes.com/robots.txt` lists AI bots and `Sitemap: https://kimbersykes.com/sitemap.xml`.
- [ ] Confirm `https://kimbersykes.com/llms.txt` loads with Services and case study links.
- [ ] Submit sitemap in [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters).
- [ ] Re-test bot fetch: `curl.exe -A "ClaudeBot/1.0" -I https://kimbersykes.com/`
- [ ] Spot-check JSON-LD: [Google Rich Results Test](https://search.google.com/test/rich-results) on homepage and one `/work/[slug]` page.

---

## Image performance notes

- `next.config.ts` sets `images.unoptimized: true` (required for static export on Cloudflare Pages without an image optimizer).
- Hero images use `next/image` with `sizes`; gallery images use `loading="lazy"`.
- Run locally to list portfolio JPEGs over 500KB:
  ```powershell
  Get-ChildItem -Path public\images\work -Recurse -Include *.jpg,*.jpeg,*.png,*.webp |
    Where-Object { $_.Length -gt 500KB } |
    Sort-Object Length -Descending |
    Select-Object @{N='KB';E={[math]::Round($_.Length/1KB,1)}}, FullName
  ```
  Compress any large heroes before commit if Lighthouse flags LCP.

---

## TODO: alt text (manual review)

Gallery alts use role/location context from project data, not visual scene description. For stronger AI/accessibility citations, review gallery photos and replace generic “event photograph N of M” strings with what each image actually shows (stage, crowd, branding, etc.) in `app/work/[slug]/page.tsx` (`projectGalleryAlt`).

`components/WorldMap.tsx` uses `alt=""` on pin thumbnails (decorative within a labelled map control).

---

## Out of scope (unchanged)

Visual design, colours, fonts, layout aesthetic, case study body copy, analytics, and third-party integrations.
