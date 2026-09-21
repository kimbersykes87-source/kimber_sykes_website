# Claude brief: kimbersykes.com weekly traffic email

**Purpose:** Hand this file to Claude before changing the weekly traffic report that lands in Kimber’s inbox. It describes the **kimbersykes.com** email (AI vs human pageviews + ranked AI crawlers), not the Rubber Armstrong GA4 Monday mail, and not this repo’s email-signature HTML.

**Last verified:** 21 September 2026, from the 20 September 2026 send plus the live site. The Next.js / Worker source that builds the mail is **not in this GitHub repo**.

---

## 1. Which email this is

Example send (Sunday 20 September 2026):

| Field | Value |
|--------|--------|
| From | `kimbersykes.com traffic <kimber@kimbersykes.com>` |
| To | `kimber@kimbersykes.com` |
| Subject | `kimbersykes.com: Weekly Traffic Report 2026-09-20` |
| Window printed in the body | `UTC window: 2026-09-13T08:00:14.592Z → 2026-09-20T08:00:14.592Z` |

That window is a **rolling 7-day UTC slice ending at send time**, not a calendar Monday–Sunday. The `.592` milliseconds look like `new Date()` at cron fire, then minus 7 days. 20 Sep 2026 08:00 UTC is Sunday 09:00 London (BST). Treat the job as **weekly, ~08:00 UTC Sunday**.

HTML body (dark theme, tables):

1. **Header** — `kimbersykes.com` / `Weekly traffic report • YYYY-MM-DD` / the UTC window.
2. **AI vs human (pageviews)** — rows `AI crawlers` and `Human visitors`; columns This week / Prior week / Change (percent).
3. **AI crawlers (ranked)** — one row per bot, same three columns, sorted by this-week count desc.

Sample numbers from that send:

| Traffic | This week | Prior week | Change |
|---------|-----------|------------|--------|
| AI crawlers | 11,399 | 19,110 | −40% |
| Human visitors | 71,400 | 45,563 | +56% |

| # | AI crawler | This week | Prior week | Change |
|---|------------|-----------|------------|--------|
| 1 | ClaudeBot | 2,552 | 3,055 | −17% |
| 2 | GPTBot | 1,911 | 3,088 | −38% |
| 3 | OAI-SearchBot | 1,566 | 1,988 | −21% |
| 4 | ChatGPT-User | 933 | 1,633 | −43% |
| 5 | Amazonbot | 650 | 1,399 | −53% |
| 6 | CCBot | 566 | 899 | −37% |
| 7 | Bytespider | 533 | 2,322 | −77% |
| 8 | GoogleOther | 488 | 244 | +100% |
| 9 | PerplexityBot | 433 | 966 | −55% |

(The screenshot’s doubled last letters on headers — “This weekk”, “changee” — are a webfont/render glitch, not the real copy.)

Do **not** confuse this with:

- Rubber Armstrong `sendWeeklyAnalyticsReport` (GA4 → Apps Script → `rubberarmstrongcamp@gmail.com`).
- RA invitation / SOI tracking pixels in **RA_Emails**.
- This repo’s Gmail/Outlook **signature** at `assets.kimbersykes.com`.

---

## 2. It does not scrape the website

Nothing in this pipeline fetches `https://kimbersykes.com` HTML and parses the DOM.

AI crawlers **do not run JavaScript**. Client tags (GA4, Plausible, gtag) never see ClaudeBot / GPTBot. The live homepage has **no** gtag, GTM, Plausible, Umami, PostHog, or Cloudflare Web Analytics beacon.

So the report can only come from **HTTP/CDN request logs** (or an edge worker that classifies each request as it happens). “Scrape” here means: **read request metadata (User-Agent, path, time) and aggregate pageviews**, then email the totals.

---

## 3. What the live site tells us

**kimbersykes.com** is a Next.js App Router site on Cloudflare (`server: cloudflare`, `/_next/static/...`, `cache-control: public, max-age=0, must-revalidate`). Custom domain sits on Cloudflare DNS (`andronicus` / `etta`). `assets.kimbersykes.com` is a *different* Pages project (this repo).

There is no client analytics snippet. Collection is edge/log-side.

### robots.txt is the crawler allow-list

`https://kimbersykes.com/robots.txt` explicitly **Allow: /** for the same families that appear in the email:

```
GPTBot, OAI-SearchBot, ChatGPT-User,
ClaudeBot, Claude-Web, anthropic-ai,
PerplexityBot, Perplexity-User,
Google-Extended, GoogleOther,
Amazonbot, Applebot-Extended, Bytespider, CCBot,
cohere-ai, DiffBot, FacebookBot, Meta-ExternalAgent,
ImagesiftBot, peer39_crawler, Timpibot, YouBot
```

Plus a generic `User-Agent: * Allow: /`.

The ranked table is that list (or a subset) matched against `User-Agent`. A request whose UA contains `ClaudeBot` increments the ClaudeBot bucket; anything that does not match the AI list is counted as **Human visitors**. That second bucket is therefore “not a known AI crawler” — it can include real people, Googlebot, preview bots, and any unmatched UA. That is the only way 71k “human” pageviews in a week is plausible on a portfolio site if the metric is **HTML requests** (or all requests) rather than unique people.

### llms.txt is what those crawlers are meant to read

`https://kimbersykes.com/llms.txt` is a markdown briefing (services, case studies, contact). Sitemap includes `/llms.txt`. The weekly email is the feedback loop: did those allowed crawlers actually hit the site, and did human traffic move?

### Mail path

SPF for kimbersykes.com:

```
v=spf1 include:_spf.google.com include:amazonses.com ~all
```

The From address is `kimber@kimbersykes.com` with display name `kimbersykes.com traffic`. That is **Amazon SES** (not Gmail SMTP, not MailApp, not Cloudflare Email Routing). Google is on SPF for normal mailbox send; SES is for this automated mail.

---

## 4. How the data is collected (the “scrape”)

### Per request (continuous)

On every request that counts as a pageview (almost certainly HTML / document requests for `kimbersykes.com`, not every CSS/image — confirm in source):

1. Read `User-Agent`.
2. Match against the known AI crawler table (same names as robots.txt / the email).
3. If match → increment that bot’s pageview count for the current UTC day/week.
4. If no match → increment `Human visitors`.
5. Persist the increment (see storage below).

Matching is substring / starts-with on the bot token (`ClaudeBot`, `GPTBot`, …), not a full-browser parse. `ChatGPT-User` and `GPTBot` are different OpenAI products and are counted separately in the mail, so the matcher must not collapse them into one “OpenAI” bucket.

Crawler hits never execute the Next.js client bundles. Confirm: those bundles contain no `ClaudeBot` / `pageview` / analytics collector strings. Do not add a browser beacon to “fix” crawler counts; it will not fire.

### Weekly job (~08:00 UTC Sunday)

1. Take `now = new Date()` (the timestamp printed as the window end).
2. `thisWeek = [now - 7d, now)`, `priorWeek = [now - 14d, now - 7d)`.
3. Sum AI-crawler pageviews and human pageviews in each window.
4. For each known bot, sum this week and prior week; drop zeros or keep a top-N (the sample shows 9 rows; robots.txt has more names — either only non-zero bots are listed, or only a ranked subset).
5. Percent change: `(this - prior) / prior`, with a defined rule when prior is 0 (the +100% GoogleOther row may be a cap, or prior was 244).
6. Render the HTML tables.
7. SES send: From `kimbersykes.com traffic <kimber@kimbersykes.com>` → `kimber@kimbersykes.com`, subject `kimbersykes.com: Weekly Traffic Report YYYY-MM-DD`.

### Where those counts most likely live

The site is on Cloudflare and has no first-party analytics JS. Ranked implementations, in order of likelihood:

| Mechanism | How the weekly job “scrapes” |
|-----------|------------------------------|
| **A. Cloudflare GraphQL Analytics API** (`httpRequestsAdaptiveGroups`) | Cron queries two datetime windows, filters `clientRequestHTTPHost = kimbersykes.com`, groups by `userAgent` (or botDetectionId). No app database. Classify UA in the script. |
| **B. Cloudflare Worker / Pages Function on the request path** | Middleware increments Analytics Engine / KV / D1 counters (`bot=ClaudeBot\|human`, `day=YYYY-MM-DD`). Cron reads aggregates. |
| **C. Logpush → R2/S3** | Weekly job scans access logs, greps UAs, emails SES. |

A and B are the ones to look for first (`wrangler.toml` cron, `scheduled` handler, `graphql` + `api.cloudflare.com`, `AnalyticsEngineDataset`, `SESV2`).

This repo (`kimber_sykes_website`) has **none** of that. The Next.js app that *is* kimbersykes.com is not the `email-signature/` tree. If you only have this repo, you cannot change the report — you need the site/worker project (private or local; not under the public `kimbersykes87-source` list as of this writing).

---

## 5. Metric definitions Claude should keep stable

| Email label | Meaning |
|-------------|---------|
| Pageviews | Count of qualifying HTTP requests in the window. Confirm whether that is HTML-only (`Accept` / path not `/_next/` / not static assets) or all 200s. The “human” magnitude suggests either HTML+bots-as-human or all requests. |
| AI crawlers (total) | Sum of pageviews whose UA matched the AI list. Should equal the sum of ranked rows if every matched bot is listed. |
| Human visitors | Pageviews that did **not** match the AI list. **Not** unique visitors. Name is misleading. |
| This week | `[end-7d, end)` using the printed UTC end. |
| Prior week | The 7 days immediately before this week. |
| Change | Week-over-week percent on that row. |

Do not switch this report to GA4. GA4 would zero out the crawler table.

---

## 6. What to open when you have the real source

Search the kimbersykes.com Next.js / Worker repo (not this one) for:

```
Weekly Traffic Report
UTC window
AI crawlers
ClaudeBot
amazonses / SES / SendEmail
httpRequestsAdaptiveGroups
scheduled
cron
```

Likely files:

- `wrangler.toml` — `triggers.crons` (expect something like `14 8 * * 0` or `0 8 * * 0`)
- a `scheduled(event, env, ctx)` Worker, or `functions/scheduled.ts` / `app/api/cron/...`
- a crawler map shared with `public/robots.txt` (keep those lists in sync)
- SES client (AWS SDK v3 `SESv2Client` or SES API v2 over fetch)

When adding a bot (e.g. a new Anthropic UA):

1. Add `User-Agent: … Allow: /` in `robots.txt` (and mention in `llms.txt` if it is a product you care about).
2. Add the same token to the classifier used by the report.
3. Redeploy the Worker/site so both request-time counting and the weekly query see it.

---

## 7. Safe change recipes

**Add a row (top pages, countries, AI referrals)**  
If the source is GraphQL, add dimensions (`clientRequestPath`, `clientCountryName`, `clientRefererHost`) and a third table. Referrals from `chatgpt.com` / `perplexity.ai` are a different signal from crawler UAs.

**Change cadence or recipient**  
Cron expression + SES `Destination`. Subject date should stay the UTC calendar date of `window.end`.

**Do not**

- Implement this by scraping analytics.google.com or the homepage.
- Put crawler detection only in client JS.
- Collapse `GPTBot` / `OAI-SearchBot` / `ChatGPT-User` into one row unless the product owner asks — the current mail treats them as three crawlers.

---

## 8. Quick map

```
Request to kimbersykes.com
  └─ Cloudflare edge (Next.js on CF)
        └─ User-Agent vs robots.txt AI list
              ├─ match  → AI crawler bucket (ClaudeBot, GPTBot, …)
              └─ else   → "Human visitors" bucket
                    └─ counts in CF analytics / Worker store

Sunday ~08:00 UTC
  └─ cron
        ├─ query this week + prior week
        ├─ HTML tables
        └─ Amazon SES
              From: kimbersykes.com traffic <kimber@kimbersykes.com>
              To:   kimber@kimbersykes.com
```

This repo only stores the brief and the personal email signature. Edit the report in the **kimbersykes.com site/worker project**, then keep this file in sync.
