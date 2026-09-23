# Kimber Sykes — AI SEO Audit Summary (for Claude)

**Site:** https://kimbersykes.com | **Goal:** AI agents can fetch, parse, and cite the site for freelance EP hiring.  
**Verified:** May 2026, build `kQB1yFVkFU1gX2MFw_2Tg`, `curl -A "ClaudeBot/1.0"`

---

## Prompt 1 — Initial audit

Full AI-SEO upgrade requested: pre-rendered HTML, robots/sitemap/llms.txt, JSON-LD, metadata, H1s, alts, bot access.

**User decisions:** Canonical `https://kimbersykes.com` (apex). Roles: EP, Production Manager, Technical Director. **20+ years** experience (not 40+). Homepage stat **15+ countries** (conservative).

**Stack (confirmed in repo — not Eleventy/Hugo/Jekyll):**

- Next.js 15 App Router, React 18, Tailwind 4, `output: "export"` → Cloudflare Pages
- 26 case studies in `data/projects.json`
- Metadata via Next.js `Metadata` / `lib/seo.ts` — **no YAML frontmatter files exist**

**Hosting:** 403 for AI bots on apex (Cloudflare); fixed in dashboard. Worker `crawler-logger` forwards only.

## Prompt 2 — Eleven live HTML issues

| # | Issue | Target state |
|---|--------|--------------|
| 1 | YAML `---` / `meta-description:` in body | Real `<meta>` + `<title>` in `<head>` only |
| 2 | Doubled case study titles | `[Project], [Role] \| Kimber Sykes` |
| 3 | GCS 2024 role = "Technical" | **Technical Director** everywhere |
| 4 | No JSON-LD | Person (home); CreativeWork (each case study) |
| 5 | robots, sitemap, llms.txt | Bot allows + full llms template |
| 6 | `/where` map-only | Text: "Countries with on-site project delivery" |
| 7 | Country count mismatch | Align 15+ vs qualitative "worldwide" |
| 8 | Duplicated card link text | Title/client/role each once |
| 9 | No og:image on case studies | Hero JPG per slug + twitter card |
| 10 | Logo marquee 2× in SSR | `grep -c google.svg` → 1 |
| 11 | Canonical tags | Every page absolute canonical |

## Prompt 3 — Re-audit

Prior "fixed" claims failed live curl. Required grep proof from production. Priority: frontmatter → JSON-LD → templates. **H1:** was `Producer.Production.Technical.` — ask user before changing; optional H2.

## Issue 1 — Frontmatter: finding

**Not reproducible on current production Next.js deploy.**

```bash
curl -s -A "ClaudeBot/1.0" https://kimbersykes.com | head -c 500
# <!DOCTYPE html>...<head><title>Kimber Sykes — Freelance Executive Producer...

curl -s -A "ClaudeBot/1.0" https://kimbersykes.com | grep -c "meta-description"
# 0
```

If YAML still reported: wrong host, cache, or RSC misread. No gray-matter pipeline exists.

## Production status (post-deploy)

| Issue | Status | Evidence |
|-------|--------|----------|
| 1 Frontmatter | N/A on live | `meta-description` count = 0 |
| 2 Titles | Fixed | `Google Cloud Summit 2024, Technical Director \| Kimber Sykes` |
| 2 H1 | Fixed | `<h1>Google Cloud Summit 2024</h1>` (client kicker above) |
| 3 GCS role | Fixed | Technical Director in Role + body |
| 4 Logos | Fixed | `grep -c .../google.svg` → **1** (2nd set JS-cloned) |
| 5 Cards | Fixed | `Canva Studio Pop-Up` on `/work` → **1** |
| 6 /where | Fixed | "Countries with on-site project delivery" present |
| 7 H1 | User pending | Live: `<h1>Freelance Executive Producer</h1>` + `aria-hidden` tagline |
| 8 JSON-LD | Partial | Person in `<body>`; 2× `application/ld+json` (script + RSC) |
| 9 llms/robots/sitemap | OK | All HTTP 200 |

## Code touched

`lib/seo.ts`, `lib/json-ld.ts`, `lib/case-study-meta.ts`, `lib/contact.ts`, `lib/llms-txt.ts`, `lib/project-countries.ts`  
`app/page.tsx`, `app/work/[slug]/page.tsx`, `app/where/page.tsx`, `app/robots.ts`, `app/sitemap.ts`  
`components/ProjectCard.tsx`, `LogoMarquee.tsx`, `LogoMarqueeTrack.tsx`  
`scripts/generate-llms-txt.mjs`, `data/projects.json`, `AI_SEO_NOTES.md`

## Still open

H1/H2 decision; llms.txt static template vs generator; JSON-LD in head (optional); GSC/Bing submit.

## Re-verify

```bash
curl -s -A "ClaudeBot/1.0" https://kimbersykes.com | grep -c "meta-description"
curl -s -A "ClaudeBot/1.0" https://kimbersykes.com | grep -c "/logos/clients/google.svg"
curl -s -A "ClaudeBot/1.0" https://kimbersykes.com/work | grep -o "Canva Studio Pop-Up" | wc -l
curl -s -A "ClaudeBot/1.0" https://kimbersykes.com/work/google-cloud-summit-2024 | sed -n 's/.*<title>\([^<]*\)<\/title>.*/\1/p'
curl -sI -A "ClaudeBot/1.0" https://kimbersykes.com/{robots.txt,sitemap.xml,llms.txt}
```

HTML is one line — use `head -c N` or `sed`, not `head -30`.
