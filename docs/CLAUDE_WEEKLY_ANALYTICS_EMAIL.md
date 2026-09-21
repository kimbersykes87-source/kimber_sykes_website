# Claude brief: Rubber Armstrong weekly analytics email

**Purpose:** Hand this file to Claude (or any coding assistant) before changing the weekly email. It explains what the email is, where the code lives, how visitor data is collected, and how the report pulls that data. It is **not** HTML scraping.

**Last verified against source:** 21 September 2026  
**Canonical implementation:** [RA_Emails](https://github.com/kimbersykes87-source/RA_Emails)  
**Sites that generate the traffic:** [RA_Website](https://github.com/kimbersykes87-source/RA_Website)

This repo (`kimber_sykes_website`) only hosts Kimber’s personal email signature. The weekly report lives in the two repos above.

---

## 1. What it is

Every **Monday at 09:00 America/Los_Angeles**, a Google Apps Script function (`sendWeeklyAnalyticsReport`) emails a plain-text traffic report to **rubberarmstrongcamp@gmail.com**.

Subject:

```
RA Website Analytics - MMM dd - MMM dd
```

Body (plain text, not HTML):

```
Rubber Armstrong Website Analytics - Weekly Report
Period: MMM dd - MMM dd, yyyy
============================================================

SUMMARY
------------------------------------------------------------
Unique Visitors: <sum of activeUsers by country>
Total Sessions: <sum of sessions by country>
Total Page Views: <sum of screenPageViews by country>

VISITORS BY COUNTRY
------------------------------------------------------------
1. United States: 15 visitors
2. United Kingdom: 8 visitors
...

------------------------------------------------------------
View full analytics: https://analytics.google.com/
```

If the GA4 call fails, the same recipient gets:

```
Subject: RA Analytics Report Error
Body: Failed to generate analytics report: <error.message>
```

The email is **optional** in the original setup docs. Docs still describe it as something you enable with `setupWeeklyAnalytics()`. Treat “is the trigger actually installed in the live Apps Script project?” as an operational question, not something this brief can confirm.

---

## 2. Important: it does not scrape pages

Nothing in this pipeline fetches `rubberarmstrong.com` HTML, parses DOM, or crawls Cloudflare dashboards.

There are two separate stages:

| Stage | What happens | Mechanism |
|-------|----------------|-----------|
| **Collect** | Browsers on the live sites send pageviews to Google Analytics 4 | Official `gtag.js` snippet |
| **Report** | Apps Script asks GA4 for last week’s totals and emails them | Official **Analytics Data API v1beta** (`AnalyticsData.Properties.runReport`) |

Cloudflare Web Analytics is also embedded on the sites, but the weekly email **does not read it**.

---

## 3. Where the code lives

| File | Repo | Role |
|------|------|------|
| `apps-script-consolidated/Analytics.gs` | **RA_Emails** | Live report: trigger, fetch, format, send |
| `apps-script-consolidated/Config.gs` | **RA_Emails** | `ANALYTICS_CONFIG` (property, recipient, schedule, date range) |
| `apps-script-consolidated/appsscript.json` | **RA_Emails** | Enables advanced service `AnalyticsData` / `analyticsdata` v1beta |
| `scripts/google-analytics-daily-report.js` | RA_Website | **Reference / stale copy** of an older standalone script. Filename still says “daily”. Do not treat this as the live project. |
| `docs/SETUP_GUIDE.md` § Analytics Setup | RA_Website | Human setup steps |
| `docs/APPS_SCRIPT_GUIDE.md` | RA_Website | Function list + `ANALYTICS_CONFIG` excerpt |
| `docs/CLAUDE_PROJECT_OVERVIEW.md` | RA_Website | Project-wide Claude brief; mentions weekly reports only in passing |

**Apps Script project:** “SOI Form Handler”, bound to the Google Sheet “RA 2026 SOI Submissions”. Deploy / edit from the RA_Emails clasp project (`apps-script-consolidated/`), not by copying the RA_Website reference script.

**Known source defect:** `Analytics.gs` (and the matching `.js`) currently contains the **same module pasted three times** in one file. Apps Script will use the last definition of each function. Clean that up if you edit the file; do not add a fourth copy.

The RA_Website reference script `google-analytics-daily-report.js` also has a broken tail: `testReport()` is duplicated with leftover fragments after the first function ends.

---

## 4. How visitor data is collected (the “source”)

Both sites load the same GA4 web stream:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1GN0CT0WN9"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-1GN0CT0WN9');
</script>
```

| Item | Value |
|------|--------|
| Measurement ID (gtag) | `G-1GN0CT0WN9` |
| GA4 Property ID | `518391310` |
| API resource name | `properties/518391310` |
| Sites | https://rubberarmstrong.com (all main-site HTML pages) and https://soi.rubberarmstrong.com |

`gtag('config', …)` records a default page_view on load. There is no custom event layer for the weekly email. Country, users, sessions, and page views are GA4’s standard dimensions/metrics, derived from IP / Geo and the measurement protocol — not from anything this codebase computes.

GA4 data is not realtime for reporting. Setup docs say wait **24–48 hours** before trusting a test against a fresh property.

### Cloudflare beacon (not used by the email)

The same HTML also has:

```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "YOUR_CLOUDFLARE_TOKEN"}'></script>
```

The token is still a placeholder in source. Even if Cloudflare analytics is enabled in the dashboard (Pages can auto-inject), **Analytics.gs never calls Cloudflare**.

---

## 5. How the report pulls data (the “scrape”)

`getAnalyticsData()` in `Analytics.gs` builds one GA4 runReport request:

```javascript
{
  dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
  dimensions: [{ name: 'country' }],
  metrics: [
    { name: 'activeUsers' },
    { name: 'sessions' },
    { name: 'screenPageViews' }
  ]
}
```

Then:

```javascript
AnalyticsData.Properties.runReport(request, ANALYTICS_CONFIG.propertyId)
```

`ANALYTICS_CONFIG.propertyId` is the string `'properties/518391310'`.

### What each field means

| API field | Email label | Notes |
|-----------|-------------|--------|
| `activeUsers` | Unique Visitors | Counted **per country row**, then summed. A user who appeared in two countries would be counted twice in the headline total. |
| `sessions` | Total Sessions | Same: sum of country rows. |
| `screenPageViews` | Total Page Views | GA4 “views” metric (web page views + any screen views). Sum of country rows. |
| `country` | Visitors by country | Sorted descending by users. **All countries**, not a top-10. SETUP_GUIDE incorrectly says “top 10”. |

Empty response (`!response.rows`) yields zeros and “No visitors recorded”.

### Date range: two clocks

1. **API query** uses GA4 relative dates `'7daysAgo'` → `'yesterday'` (GA4 property timezone).
2. **Email header / subject** independently compute “today − 7 days” through “today − 1 day” in `America/Los_Angeles` via `Utilities.formatDate`.

Those two windows are *intended* to match but are not the same object. If you change the API range, update `formatEmailReport` / `sendEmail` or they will lie in the subject line.

The Apps Script **project** timezone in `appsscript.json` is `America/Denver`. The **trigger** is explicitly `America/Los_Angeles`. Monday 09:00 means Pacific, not Denver.

---

## 6. Runtime flow

```
Monday 09:00 PT
    │
    ▼
ScriptApp time-based trigger
    │
    ▼
sendWeeklyAnalyticsReport()
    │
    ├─ getAnalyticsData()
    │      └─ AnalyticsData.Properties.runReport(...)
    │             └─ parseAnalyticsResponse(response)
    │                    • sum metrics
    │                    • sort countries by users desc
    │
    ├─ formatEmailReport(data)   // plain-text body
    │
    └─ sendEmail(body)           // MailApp.sendEmail
           to: rubberarmstrongcamp@gmail.com
```

Auth is implicit: the Apps Script runs as the deploying Google account (`executeAs: USER_DEPLOYING`) and uses that account’s access to the GA4 property. There is no service-account JSON and no scraping credentials in the repo.

---

## 7. Configuration (single source of truth)

From RA_Emails `apps-script-consolidated/Config.gs`:

```javascript
const ANALYTICS_CONFIG = {
  propertyId: 'properties/518391310',
  emailRecipient: 'rubberarmstrongcamp@gmail.com',
  schedule: {
    dayOfWeek: ScriptApp.WeekDay.MONDAY,
    hour: 9,
    timezone: TIMEZONE.LA   // 'America/Los_Angeles'
  },
  dateRange: {
    startDate: '7daysAgo',
    endDate: 'yesterday'
  }
};
```

Change recipient, cadence, or property **here**. `Analytics.gs` already reads `ANALYTICS_CONFIG`; do not fork a second copy inside `Analytics.gs`.

The older RA_Website script inlines its own `ANALYTICS_CONFIG` and does not import Config.gs.

---

## 8. Functions Claude should know

| Function | File | What it does |
|----------|------|----------------|
| `setupWeeklyAnalytics()` | Analytics.gs | Deletes existing `sendWeeklyAnalyticsReport` triggers, creates Monday 09:00 PT trigger. Run **once** from the Apps Script editor. |
| `sendWeeklyAnalyticsReport()` | Analytics.gs | Production entry point. Trigger target. |
| `getAnalyticsData()` | Analytics.gs | GA4 runReport + parse. |
| `parseAnalyticsResponse(response)` | Analytics.gs | Rows → `{ totalUsers, totalSessions, totalPageViews, countries[] }`. |
| `formatEmailReport(data)` | Analytics.gs | Plain-text body. |
| `sendEmail(body)` | Analytics.gs | `MailApp.sendEmail`. |
| `testAnalyticsReport()` | Analytics.gs | Live GA4 pull + real email. Use this to verify API access. |
| `testAnalyticsReportWithSampleData()` | Analytics.gs | Fake numbers, no API call. Use this to verify mail only. |
| `viewAnalyticsConfig()` | Analytics.gs | Alert / log of current config. |

Reference-script equivalents in RA_Website: `setupWeeklyTrigger()`, `testReport()` — same idea, older names.

---

## 9. Enabling / debugging

One-time enable (from the SOI Form Handler Apps Script project):

1. Services → add **Google Analytics Data API** (`AnalyticsData`). Already declared in `appsscript.json`.
2. The Google account that owns the script must have access to GA4 property `518391310`.
3. Run `setupWeeklyAnalytics()`.
4. Triggers panel should show `sendWeeklyAnalyticsReport`, weekly, Monday, 09:00, `America/Los_Angeles`.
5. Smoke tests:
   - `testAnalyticsReportWithSampleData()` → email arrives, no API.
   - `testAnalyticsReport()` → real numbers + email.
6. Executions log (clock icon) for `AnalyticsData` / permission errors.

Common failures:

- Property ID missing the `properties/` prefix, or using the Measurement ID `G-1GN0CT0WN9` instead of `properties/518391310`.
- Analytics Data API not enabled, or the script user is not a GA4 user.
- Empty week (no rows) looks like “the scraper failed”; it is a valid zero report.
- MailApp daily quota if someone loops tests.

---

## 10. What this email is not

- **Not** campaign-open / click tracking. Invitation, SOI reminder, and confirmation tracking use a Cloudflare Worker + tracking pixels and write to the `Email_Campaign_2026` / `SOI_Approved` sheet tabs. That is RA_Emails `cloudflare-worker/` + `gmail-automation.gs`. Different system.
- **Not** SOI submission counts. Those live in Google Sheets tabs (`SOI_Staging`, `SOI_Approved`, …).
- **Not** Cloudflare Web Analytics.
- **Not** HTML or PDF. Plain text only via `MailApp.sendEmail({ body })`.
- **Not** a newsletter to campers. Internal ops mail to `rubberarmstrongcamp@gmail.com`.

---

## 11. Safe change recipes

**Add a metric or dimension**  
Edit the `request` in `getAnalyticsData()`, extend `parseAnalyticsResponse()`, then add a line in `formatEmailReport()`. Keep dimension/metric names as GA4 Data API names (`activeUsers`, `country`, `pagePath`, …).

**Change schedule or recipient**  
`ANALYTICS_CONFIG` in Config.gs, then re-run `setupWeeklyAnalytics()` so the trigger is recreated. Editing config alone does not move an existing trigger.

**HTML email**  
`sendEmail()` would need `htmlBody` (and probably keep `body` as plaintext fallback). Nothing in the current formatter emits HTML.

**Do not** implement page scraping of analytics.google.com or rubberarmstrong.com to populate this report. The Data API is the supported path and already has the property wired.

---

## 12. Quick map for Claude

```
Browser
  └─ gtag.js  G-1GN0CT0WN9
        └─ GA4 property 518391310
              └─ Analytics Data API v1beta
                    └─ Apps Script Analytics.gs  (RA_Emails)
                          └─ MailApp → rubberarmstrongcamp@gmail.com
                                Mondays 09:00 America/Los_Angeles
```

When asked to “fix the weekly email” or “change how it scrapes data”, start in **RA_Emails** `Config.gs` + `Analytics.gs`. Use RA_Website `scripts/google-analytics-daily-report.js` only as historical reference.
