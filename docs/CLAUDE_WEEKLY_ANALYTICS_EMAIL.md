# Claude brief: kimbersykes.com weekly traffic email

**Purpose:** Hand this file to Claude before changing the weekly traffic report that lands in Kimber’s inbox. It describes the **kimbersykes.com** email (AI vs human pageviews + ranked AI crawlers), not the Rubber Armstrong GA4 Monday mail, and not this repo’s email-signature HTML.

**Last verified:** 21 September 2026, from the 20 September 2026 send, the live site, and a Cloudflare D1 quota email (100k rows written / day on the Workers Free plan). The Next.js / Worker source that builds the mail is **not in this GitHub repo**.

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
5. Persist the increment in **Cloudflare D1** (confirmed: the account hit the D1 free-tier write cap).

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

### Storage: Cloudflare D1 (confirmed)

On 21 September 2026 Cloudflare emailed:

> You have exceeded the daily D1 free tier limit of **100,000 rows written** on account Kimbersykes87@gmail.com's Account. D1 row write requests will return errors until **2026-09-22 00:00:00 UTC**. Stored data is not affected. Plan: **Workers Free**.

That settles the store: a Worker (or Pages Function) on the request path **writes D1 rows**. The Sunday job is a `SELECT`/aggregate over those rows, then SES. It is not GraphQL-only and not Logpush.

D1 limits are **per Cloudflare account**, not per database. Every D1 on this account (kimbersykes.com traffic plus anything else) shares the 100k writes/day Free cap. `INSERT`, `UPDATE`, and `DELETE` all count as rows written. Reads still work while writes are blocked.

**While writes are blocked (until 00:00 UTC 22 Sep 2026):** new traffic is **not recorded**. The next weekly email will undercount this gap. Existing rows stay; the mail can still send from old data.

None of the public `kimbersykes87-source` repos bind D1 in `wrangler.toml`. The database and writer live in the private/local **kimbersykes.com** site/worker project.

### Why 100k writes/day is the wrong shape for this report

The weekly mail’s own numbers are ~82k pageviews **per week** (~12k/day). Hitting **100k writes in one UTC day** means the collector is not “one write per HTML pageview”. Typical causes, look for all of them:

| Cause | Why it blows the cap |
|--------|----------------------|
| One `INSERT` per HTTP request, including `/_next/static/*`, images, preloaded logos | Homepage preloads ~45 client SVGs plus JS/CSS. One human load can be 50+ writes. |
| `INSERT` **and** `UPDATE` of a summary row per request | Two writes per hit. |
| UPSERT `count = count + 1` per request | An `UPDATE` still counts as a row written. Does not save quota. |
| Crawlers following every URL + assets | ClaudeBot/GPTBot do not execute JS but they do fetch HTML (and sometimes linked files). |
| A write loop / retry on error | Errors after the cap can still retry and keep failing. |
| Other D1 apps on the same account | Shared 100k/day. |

Fix in the site/worker repo (do **not** “just upgrade” as the first move unless they want Paid):

1. **Count HTML documents only** — skip `/_next/`, `/images/`, `/favicon`, `RSC`/data fetches, `HEAD`.
2. **Stop per-request row logs** if the email only needs weekly totals. Keep a tiny aggregate table `(day TEXT, bot TEXT, views INTEGER)` and **buffer in memory/KV**, flushing once a minute (or once per isolate) with a batched `INSERT`. Target: tens of writes/day, not 100k.
3. Or drop D1 for ingest and use **Workers Analytics Engine** (built for high-volume event writes); D1 stays for nothing, or only for a daily rollup.
4. Or stop writing on the hot path entirely and pull **Cloudflare GraphQL** `httpRequestsAdaptiveGroups` in the Sunday cron (zero D1 writes).
5. Paid plan is `$5/mo` and 50M writes/month — a backstop, not a substitute for (1)–(4).

`ON CONFLICT DO UPDATE SET count = count + 1` on every request still burns one write per request. Batching is what actually drops quota use.

This repo (`kimber_sykes_website`) has **none** of that. If you only have this repo, you cannot change the collector — you need the site/worker project.

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
d1_databases
env.DB / env.D1
INSERT INTO
scheduled
cron
```

Likely files:

- `wrangler.toml` — `[[d1_databases]]` plus `triggers.crons` (expect something like `0 8 * * 0` or `14 8 * * 0`)
- a request-path Worker/middleware that `env.DB.prepare(...).run()`
- `migrations/*.sql` — request log table vs daily aggregate table
- a `scheduled(event, env, ctx)` handler that `SELECT`s D1 and sends SES
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

**Stop the D1 write storm (priority if quota emails keep arriving)**  
Skip static assets; buffer and flush aggregates; or move ingest off D1. See §4.

**Do not**

- Implement this by scraping analytics.google.com or the homepage.
- Put crawler detection only in client JS.
- Collapse `GPTBot` / `OAI-SearchBot` / `ChatGPT-User` into one row unless the product owner asks — the current mail treats them as three crawlers.
- “Fix” the quota by inserting fewer columns or using UPSERT still once per request — that still counts as a write.

---

## 8. Quick map

```
Request to kimbersykes.com
  └─ Cloudflare edge (Next.js on CF)
        └─ User-Agent vs robots.txt AI list
              ├─ match  → AI crawler bucket (ClaudeBot, GPTBot, …)
              └─ else   → "Human visitors" bucket
                    └─ D1 write  (Workers Free: 100k rows written / UTC day / account)

Sunday ~08:00 UTC
  └─ cron
        ├─ SELECT aggregates from D1 (this week + prior week)
        ├─ HTML tables
        └─ Amazon SES
              From: kimbersykes.com traffic <kimber@kimbersykes.com>
              To:   kimber@kimbersykes.com
```

This repo only stores the brief and the personal email signature. Edit the report in the **kimbersykes.com site/worker project**, then keep this file in sync.
