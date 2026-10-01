# kimbersykes.com: SEO and AI answer engine audit

**Phase 1 of 3 (audit only, no code changed).** Audited 29 September 2026 against the repo at `C:\dev\KS_Website`, the latest build in `out/` (28 Sep 2026) and the live site.

> **Confirmed by Kimber, 1 October 2026 (applies to the whole file):**
> - **Google Cloud Summit London 2024, 2025 and 2026 are all credited Senior Production Manager.** Mentions below of a "Technical" credit for 2024 or "Production Manager" for 2025 describe the site as it stood on 29 September and are superseded.
> - **Career dates** are as published on the About page and the CV: Everest Event Enterprises, Sydney, 2003 to 2007; t7 event solutions, Sydney, January 2008 to March 2011; Exposure, London, April to December 2011; Pulse Group, London, January 2012 to February 2015; freelance, worldwide, March 2015 to present.

## Summary

Some of the groundwork is already in place and working. The site is a static export, every page sends real HTML, and canonicals, Open Graph and Twitter cards are present. JSON-LD is injected into `<head>`, and `llms.txt` and `robots.txt` are generated. The Cloudflare 403 has been fixed: on the live site I got HTTP 200 for a browser, ClaudeBot, Claude-SearchBot, GPTBot, PerplexityBot and Bingbot. `www` returns a 301 to the apex, a trailing slash returns a 308 to the version without one, and missing pages return a real 404.

The main problems:

1. **The portfolio index (`/work`) has no case studies in its HTML.** Crawlers see a heading and an empty skeleton. None of your 30 case studies is linked from the page that is supposed to list them.
2. **The site contradicts itself about Google Cloud Summit**, your most citable credit. AI engines play down facts they cannot reconcile.
3. **There is no single definition of who you are.** Your one-line description has 8+ different wordings. The homepage H1 is the single word "Freelance". Most page titles leave out your name. A `Kimber Sykes Limited` constant is in the code even though you trade as a sole trader, and one UI string calls you "hers".
4. **The schema graph is disconnected.** There are no `@id`s, so the Person, business, website and 30 case studies are not linked to each other.
5. **The content is thin.** The 30 case studies average about 62 words each, and only one reports an outcome. There is no About page that answers "who is Kimber Sykes", and there are no FAQ or service pages, so there is nothing that directly answers a buyer's question.

Fixing items 1 to 4 is mostly engineering and needs few answers from you. Item 5 needs the questions at the end of this file.

---

## Ranked action list

Impact: **H**igh / **M**edium / **L**ow. Effort: **S** (under an hour), **M** (half a day), **L** (needs your input or several sessions).

| # | Issue | Impact | Effort | Batch |
|---|-------|--------|--------|-------|
| 1 | `/work` renders no case study links in static HTML | H | S | Tech |
| 2 | Contradictory Google Cloud Summit facts (About vs case studies) | H | S (needs answers) | Content |
| 3 | Homepage H1 is "Freelance"; role tagline is `aria-hidden`; intro is vague | H | S | Tech/Content |
| 4 | Page titles on About, Work, Clients, Where, Contact omit "Kimber Sykes" | H | S | Tech |
| 5 | No coherent `@id` entity graph; schema semantics off in places | H | M | Schema |
| 6 | One-line identity differs everywhere; `Kimber Sykes Limited`; "hers" | H | S | Content |
| 7 | About page is not an entity page (H1 "Why hire me", no career summary) | H | M | Content |
| 8 | Case studies thin (avg ~62 words, 1 of 30 has outcomes) | H | L | Content |
| 9 | No FAQ, no service pages, no answer-first copy | H | M | Content |
| 10 | Weak internal linking (prev/next only, no breadcrumbs, no related work) | M | S | Tech |
| 11 | Case study heroes are 600 KB to 1.1 MB JPEGs, no WebP/AVIF, `priority` at 100vw | M | M | Perf |
| 12 | Homepage preloads 47 logo images, competing with the hero (LCP) | M | S | Perf |
| 13 | `og:site_name` and `og:locale` missing on every page | M | S | Tech |
| 14 | Em dashes in titles, meta, schema, llms.txt, UI strings | M | S | Tech |
| 15 | llms.txt issues; no llms-full.txt | M | S | AI |
| 16 | Sitemap `lastmod` is build time on every URL; includes `llms.txt` | M | S | Tech |
| 17 | Gallery alt text is generic ("event photograph 3 of 7") | M | M | A11y |
| 18 | `/clients` is logos only (48 words); many brands have no supporting context | M | M | Content |
| 19 | robots.txt missing Claude-SearchBot, Claude-User, Bingbot, Applebot by name | L | S | AI |
| 20 | Default Next.js 404 with conflicting robots metas | L | S | Tech |
| 21 | RSC payload files (`/about.txt`, `/index.txt` etc.) are publicly crawlable | L | S | Tech |
| 22 | `<html lang="en">` should be `en-GB` | L | S | Tech |
| 23 | No visible "last updated" dates | L | S | Content |
| 24 | Stale/unused code and docs (`lib/llms-txt.ts`, old audit notes) | L | S | Hygiene |

---

## 1. Technical SEO

### 1.1 `/work` ships no project links (Critical, #1)
`app/work/page.tsx` wraps `WorkProjectList` in `<Suspense>`. The list is a client component that calls `useSearchParams()`, so the static export only renders the fallback (30 grey skeleton boxes). Evidence: `out/work.html` has about 45 words and **0** `href="/work/..."` links. On the live site, `curl -A ClaudeBot https://kimbersykes.com/work` also returns 0 case study links.

At the moment, case studies can only be found through the sitemap, the 4 featured cards on the homepage and the prev/next chains.

**Change:** render the full list on the server as plain links, grouped under server-rendered H2s by sector (B2B Tech, Consumer brand activations, Sports sponsorship). Keep the `?q=` filter as a progressive enhancement: hydrate the list, then read `window.location.search` in `useEffect` so there is no Suspense bailout. Or remove the search if nobody uses it (the Cloudflare analytics would show this). Also remove the `WebSite` `SearchAction`: Google retired the sitelinks search box in 2024, and this one points at client-side search.

### 1.2 Homepage heading and intro (#3)
- The `<h1>` is only "Freelance". "Producer. Production. Technical." is a `<p aria-hidden="true">`, which hides it from screen readers and weakens it for parsers. The previous audit left this as "user pending".
- The first body sentence ("Events professional specialising in ... Widely networked worldwide and known for strategic, hands-on leadership.") is the least quotable line on the site.
- **Proposed (visual design unchanged):** keep the big display lines as they look now. Remove `aria-hidden` and make the H1 read as one phrase ("Freelance Producer. Production. Technical.") with the same styling. Replace the intro paragraph with the canonical one-liner from section 4. The CTA "See What" could become "See the work".

### 1.3 Titles and descriptions (#4, #14)
| Page | Current title | Problem |
|---|---|---|
| Home | Kimber Sykes [em dash] Freelance Executive Producer \| Corporate & Experiential Events | em dash; omits PM/TD |
| About | About [em dash] Executive Producer & Production Manager | no name, drops Technical Director |
| Work | Portfolio [em dash] Corporate Events & Brand Activations | no name |
| Clients | Clients & Agencies [em dash] Global Brands | no name |
| Where | Global Project Locations [em dash] 18 Countries | no name |
| Contact | Contact [em dash] Freelance Event Production | no name |
| Case study | `{Project}, {Role} \| Kimber Sykes` | good; keeps credits as written (e.g. "Google Cloud Summit London 2024, Senior Production Manager") |

`buildPageMetadata` uses `title.absolute`, so the layout's `%s | Kimber Sykes` template never applies. **Change:** static pages use `"{Topic} | Kimber Sykes"`. The home page becomes something like "Kimber Sykes | Freelance Executive Producer, Production Manager, Technical Director, London". No dashes anywhere.

Case study meta descriptions are the first sentence of the body. Several of those do not mention you or your role (e.g. Visa: "a global innovation program that challenges startups..."). **Change:** generate descriptions from the new one-sentence summary (client, event, city, year, role).

### 1.4 Canonicals, redirects, trailing slash
All fine. Every indexable page has an absolute canonical. `trailingSlash: false` matches the Pages behaviour (308 to the version without the slash, `/about.html` returns a 308 to `/about`), and `www` returns a 301 to the apex. No change needed.

### 1.5 Open Graph / Twitter (#13)
Each page's `openGraph` object replaces the layout's, so `og:site_name` and `og:locale` are missing on **every** page. `og:image` has no width or height. **Change:** set both fields in `buildPageMetadata`, and add image dimensions.

### 1.6 Sitemap (#16)
37 URLs, all real. But `lastModified: new Date()` stamps every URL with the build time, which gives a false freshness signal that Google learns to ignore. **Change:** add an `updated` date per project in `projects.json` (and per static page), and emit those. Drop `/llms.txt` from the sitemap (it is not an HTML page). Add the new pages.

### 1.7 Images and Core Web Vitals (#11, #12)
- `images.unoptimized: true` (needed for static export), so `next/image` serves the original files. `public/images/work` is 279 files and 90 MB, with 0 WebP. Case study heroes are marked `priority` at `sizes="100vw"`, and the largest are 1.1 MB (aqua-rugby), 1.07 MB (johnson-johnson), 0.91 MB (expo-2020), 0.89 MB (aperol) and so on. This is the main LCP risk on mobile.
- **Change:** a prebuild `sharp` script that writes WebP (and optionally AVIF) at 640/1200/2000 widths next to the originals, plus a small `<picture>` component. The homepage hero already uses this pattern by hand.
- The homepage emits **47** `<link rel="preload" as="image">` tags for marquee logos, all competing with the hero. **Change:** lazy-load the marquee images and remove the preloads.
- Fonts come from `next/font` (self-hosted, `display: swap`), and there is one CSS file. Fine.

### 1.8 Client-side-only content
Nothing important apart from `/work` (1.1). `KimberRightNow` (live location) and the map's country geometry (fetched from jsDelivr at runtime) are client-side. The country and city list on `/where` is server-rendered text, which is good.

### 1.9 404 (#20)
The default Next 404 has two robots metas (`noindex` and `index, follow`) and the homepage `<title>` as a second title. **Change:** add `app/not-found.tsx` with the site design, a single `noindex`, and links to Work, About and Contact.

### 1.10 Other
- The RSC `.txt` payloads (`/about.txt`, `/work/*.txt`) are publicly served as `text/plain` (#21). **Change:** add `X-Robots-Tag: noindex` for those exact paths in `public/_headers`, and not for `/llms.txt` or `/robots.txt`.
- `lang="en"` should be `en-GB` (#22).
- Nav anchor text ("What / Who / Where / Why / How") is short, but the tooltip text is inside the link in the HTML, so crawlers see "What I have delivered" and so on. Acceptable, so it stays as designed.

---

## 2. AI crawler access

| Check | Result |
|---|---|
| Live HTTP status for Mozilla, ClaudeBot, Claude-SearchBot, GPTBot, PerplexityBot, bingbot | **200** for all (tested 29 Sep 2026) |
| robots.txt allows `*` | Yes, so every bot is allowed by default |
| Named in robots.txt | GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended and others |
| **Not named** | Claude-SearchBot, Claude-User, Bingbot, Applebot (all still allowed through `*`) |
| Key content in static HTML | Yes, **except `/work`** (see 1.1) |
| Crawler-logger Worker | Logs only and forwards to `pages.dev`; does not block |

**Change (#19):** add Claude-SearchBot, Claude-User, Bingbot and Applebot explicitly. Drop the non-standard `Host:` line. Keep the list in `lib/ai-crawlers.ts` as the single source.

---

## 3. Structured data (#5)

### What exists
- **Home** (`<head>`, post-build script): `Person`, `WebSite` (with a `SearchAction` to client-side search), `ProfessionalService`, as three separate blocks with no `@id`s.
- **About**: `Person` in `<body>` (not in the head script).
- **Contact**: `ContactPage` + `Person` `@graph` in the body.
- **Work**: `CollectionPage` in the body.
- **Case studies**: `CreativeWork` in the head, where `creator` is an anonymous new `Person` each time, `publisher` = agency, `sponsor` = client, `dateCreated` = year only, and there is no `url` or `image`.
- **Clients / Where**: none.
- Schema is defined twice (`lib/json-ld.ts` and `scripts/inject-json-ld-head.mjs`), and the copies have already drifted apart once.

### Problems
- There are no `@id`s, so engines cannot tell that the Person on the homepage is the same person as the 30 `creator`s.
- `addressCountry: "UK"` should be the ISO code `"GB"`.
- `publisher: agency` is wrong: the agency did not publish the page. `ProfessionalService` has no link to the Person.
- `sameAs` has only LinkedIn.
- `gender` adds nothing, so it can go.

### Proposed graph (one source of truth, emitted by the post-build script)
```
https://kimbersykes.com/#person          Person
  name, jobTitle[], description (canonical one-liner), image, url,
  homeLocation/address London GB, areaServed Worldwide,
  knowsAbout[], hasOccupation[] (Occupation x3), sameAs[] (real profiles only),
  worksFor? (no; use the business below)
https://kimbersykes.com/#business        ProfessionalService
  name "Kimber Sykes" (confirm trading name), founder/employee -> #person,
  address London GB, areaServed, url, email, knowsAbout, makesOffer -> service pages
https://kimbersykes.com/#website         WebSite  publisher -> #person, about -> #person
{page}#webpage                           WebPage / ProfilePage (About) / CollectionPage (Work)
                                         / FAQPage (FAQ) / ContactPage, isPartOf -> #website,
                                         about or mainEntity -> #person, breadcrumb -> {page}#breadcrumb
{page}#breadcrumb                        BreadcrumbList (all non-home pages)
/work/{slug}#work                        CreativeWork
  name, description (new summary), url, image, dateCreated (year),
  creator: Role { roleName: "<credit exactly as written>", creator: {@id #person} },
  producer: Organization (agency), about: Event {
     name, startDate (year or real dates), location Place (venue + city + country),
     organizer: Organization (client) }
  isPartOf -> /work#collection, mainEntityOfPage -> {page}#webpage
/services/{x}#service                    Service  provider -> #business, areaServed, subjectOf case studies
```
Using a `Role` wrapper keeps each credit exactly as written (e.g. "Senior Production Manager") while still pointing to the single Person node.

`FAQPage`: Google now shows FAQ rich results only for government and health sites, so do not expect a SERP feature. The markup is still worth adding because AI parsers use it. There will be no review or rating schema.

---

## 4. Entity consistency (#6)

Your description varies from place to place:

| Location | Wording |
|---|---|
| Home title | "Freelance Executive Producer \| Corporate & Experiential Events" |
| Home meta / OG | "Freelance Executive Producer, Production Manager, and Technical Director in London. 23 years delivering corporate summits, conferences, and experiential brand activations worldwide." |
| Home intro | "Events professional specialising in large-scale event production, experiential event delivery and creative design..." |
| Home About block | "...with 23 years leading large-scale corporate conferences, summits, product launches, and experiential brand activations." |
| Person schema | "...specialising in B2B tech conferences, consumer brand activations, and major sports sponsorship programmes. 23 years experience. Based in London, available worldwide." |
| llms.txt | "...23 years of experience across 18 countries and seven-figure budgets. Specialising in large-scale corporate events..." |
| About page | "...23 years delivering large-scale live work in three lanes..." |
| About portrait alt / OG alt | "Executive Producer and Production Manager" / "Executive Producer" |
| Footer | nothing (only the copyright line) |

Other inconsistencies:
- `lib/contact.ts` has `COMPANY_NAME = "Kimber Sykes Limited"`. It is unused, but it contradicts sole trader status and could end up in schema. **Remove it or correct it.**
- `KimberRightNow` says "Kimber is outside **hers**". The case studies use "he/his". Fix to "his".
- Agency name: "Wonder" on the site vs "We Are Wonder".
- The Oxford comma is used in some places and not others (British English usually leaves it out).

**Proposed canonical one-liner** (use it word for word in the meta description, Person `description`, llms.txt blockquote, the first sentence of About, and a new footer line):

> Kimber Sykes is a London-based freelance Executive Producer, Production Manager and Technical Director, delivering large-scale corporate events worldwide for agencies and brands across B2B tech conferences, consumer brand activations and sports sponsorship programmes.

Add a short version for the footer: "Freelance Executive Producer, Production Manager and Technical Director. Based in London, working worldwide."

---

## 5. Content

### 5.1 Contradictions to resolve first (#2)
1. **Google Cloud Summit.** About says "Production Manager for Google Cloud Summit for a 3,000 PAX conference over the last three years". The case studies say 2024 = **Technical** credit with **4,000 attendees**, 2025 = Production Manager, 2026 = **Senior** Production Manager. The 2026 text also says "third consecutive year under Kimber's production management". Proposed wording, which keeps every credit as written: "worked on Google Cloud Summit London at Tobacco Dock for three consecutive years (2024 Technical, 2025 Production Manager, 2026 Senior Production Manager)". The attendee number needs your answer. **Resolved 1 Oct 2026:** all three years are credited Senior Production Manager, with 2,500+ attendees at Tobacco Dock.
2. **Emirates tennis.** About lists "ATP (London, Paris, Barcelona, New York, Indian Wells, Rome)". The case study lists Wimbledon, Roland Garros, US Open, Barcelona, Indian Wells and Rome. Wimbledon, Roland Garros and the US Open are Grand Slams, not ATP events. Needs one accurate wording.
3. **NTT Data** is located "London, UK", but it was delivered at The Open Championship (not held in London). Needs the venue.
4. The old `CLAUDE_AI_SEO_AUDIT_SUMMARY.md` says GCS 2024 was changed to "Technical Director". The data correctly says "Technical", so the old note is wrong and should be updated or deleted. **Resolved 1 Oct 2026:** the credit for all three years is Senior Production Manager, and that note has been updated.

### 5.2 Core pages
| Page | Words (approx.) | Verdict |
|---|---|---|
| Home | 283 | Good structure. Weak H1 and intro; the stats are fine; the About block is the best copy on the site |
| About | 385 | Strong facts, but the H1 is "Why hire me", there is no "who is" opener, no career timeline, no engagement model, and a GCS contradiction |
| Work | 45 (static) | Broken for crawlers (1.1); no intro text |
| Clients | 48 | Logos only. An AI cannot tell what you did for Sony, Diageo, AmEx, Disney and others, which have no case study |
| Where | 228 | Good, factual, server-rendered list. Could link countries to case studies |
| Contact | 74 | Clear. Needs to say how agencies engage you, typical lead time and what to send |

### 5.3 Case study scores
Scored out of 10: summary facts present (client, event, city, year, role) 2, scale numbers 2, venue named 1, specific responsibilities 2, technical or production highlights 2, outcome 1.

| Case study | Credit | Words | Score | Main gaps |
|---|---|---|---|---|
| Google Cloud Summit 2026 | Senior Production Manager | 100 | 7 | attendees, outcome, "third year of PM" wording |
| Netflix Stranger Things (Paris) | Production Director | 62 | 7 | team or supplier size, responsibilities detail, outcome (attendance) |
| Geely Auto EX5 (Sydney) | Executive Producer | 68 | 7 | team size, projection tech detail, outcome |
| Emirates Aviation Experience | Project Lead | 56 | 7 | build timeline, opening date, outcome |
| GCS 2025 | Production Manager | 92 | 6 | venue not named, attendees, outcome |
| Google Pixel 3 Curiosity Rooms | Senior Producer | 59 | 6 | visitors, your specific scope |
| Emirates Global Sports | Senior Producer | 73 | 6 | tournament naming accuracy, kit spec, years |
| Expo 2020 UAE National Day | Project Lead | 49 | 6 | team size, timeline, your scope vs agency |
| Rizla Rizlab | Producer | 54 | 6 | venues, number of shows (the only one with outcomes) |
| Xerocon Denver 2026 | Technical Director | 80 | 5 | attendees, crew size, "directly supported the team" is vague |
| GCS 2024 | Technical (since changed to Senior Production Manager) | 57 | 5 | detail of AV scope, supplier, team |
| Canva Studio (Holborn) | Executive Producer | 59 | 5 | footprint, visitors, build detail |
| Yoto PlayDate 2026 | Executive Producer | 96 | 5 | venue, audience size, replica scale |
| MTV EMA After Party | Senior Producer | 69 | 5 | venue name to confirm, guest count |
| Samsung Galaxy A5 Tour | Senior Producer | 49 | 5 | cities, visitors, crew |
| Destination NSW The Long Road | Producer | 71 | 5 | channel, air date, audience |
| Xerocon London 2026 | Technical Director | 71 | 4 | "several thousand" vague; generic scope |
| Xerocon Nashville | Technical Director | 43 | 4 | venue, year context, scope |
| Aperol Spritz AO | Executive Producer | 41 | 4 | dates, footprint, outcome |
| Stella McCartney COP28 | Executive Producer | 41 | 4 | footprint, duration, visitors |
| Emirates Cricket World Cup | Senior Producer | 63 | 4 | host cities, number of matches |
| NTT Data Open Data Wall | Senior Producer | 52 | 4 | venue and location conflict, screen spec |
| EA Battlefront II | Senior Producer | 57 | 4 | stand size, visitors; "EA Sports" vs "EA" |
| Johnson & Johnson Mobile Lab | Executive Producer | 54 | 4 | tour length, stops, audience |
| Aqua Rugby (Darling Harbour) | Executive Producer | 43 | 4 | dates, attendance |
| Visa Everywhere (Paris) | Executive Producer | 45 | 3 | venue, attendees, scope |
| Mastercard UCL Final (Milan) | Senior Producer | 48 | 3 | footprint, reach |
| Mastercard British Open (Troon) | Senior Producer | 40 | 3 | footprint, visitors |
| Parrtjima | Creative Technologist | 49 | 3 | scale, number of works |
| Gunpowder Plot | Executive Producer | 44 | 3 | opening year, capacity |

Common patterns: the summaries open with the event, not with you; responsibilities are generic ("managed supplier coordination"); outcomes are missing; and the text is written in the third person in some places and uses "Kimber" as the subject in others. The Phase 2 template fixes the structure. The specifics come from the questions below.

### 5.4 Clients and gallery content (#17, #18)
- `/clients` shows 47 brands, but 20+ of them (Sony, Diageo, Philips, Peugeot, Infiniti, Jaguar, AmEx, Commonwealth Bank, Disney, Instagram, Lilly, CNN, Marriott, Pfizer and others) have no case study or context. **Change:** add a short text list under each logo grid (brand, sector, and a link to the case study where one exists). The logos stay.
- Gallery alts all read "{client} {project}, event photograph N of M". I can write real alt text by looking at each photo (describing what is visible, not inventing facts), across about 250 images.

---

## 6. AEO readiness (#7, #9)

These are questions buyers and AI engines ask. None of them has a direct, quotable answer on the site today:

| Query | Current best answer on site | Gap |
|---|---|---|
| Who is Kimber Sykes? | Home About block, paragraph 1 | not on About; H1 does not name you |
| Freelance technical director London | nothing dedicated | no Technical Direction page |
| Freelance production manager for corporate events | nothing dedicated | no Production Management page |
| Who has produced Google Cloud Summit (London)? | 3 case studies with conflicting summaries | needs one clear, consistent statement |
| Does he work white-label for agencies / under NDA? | nothing | FAQ |
| Day rate or project fee? | nothing | FAQ (no figures unless you give them) |
| Available for international travel? | "available worldwide" | FAQ with specifics |
| What size of events? | scattered numbers | FAQ + service pages |

**Proposed new pages** (each justified by distinct case studies, so none is a doorway page):
- `/services/technical-direction`: Xerocon Denver, London, Nashville; GCS 2024 (then credited Technical; now Senior Production Manager); Expo 2020 (content and projection); Geely (projection blend).
- `/services/production-management`: GCS 2025 and 2026; Netflix (Production Director); Emirates sports touring.
- `/services/executive-production`: Canva, Geely, Stella McCartney, Yoto, Visa, Aperol, J&J, Aqua Rugby, Gunpowder Plot.
- `/faq`: agency engagement, fees (no figures), travel, event scale, white-label and NDA, what you need at briefing, lead times. `FAQPage` schema on this page only.
- About rebuilt as a `ProfilePage`.

I'm **not** recommending sector or city pages: they would just repeat the `/work` sector groupings and turn into near-duplicate location pages.

---

## 7. llms.txt (#15)
- It exists, is generated at prebuild, and is served as `text/plain`. 
- Problems: em dashes in the H1 and in every link label; it points to a "Contact form" that does not exist; there are no About, Services or FAQ links; case study lines do not state your role; and `lib/llms-txt.ts` is a stale duplicate of the script.
- **Change:** rewrite it around the canonical one-liner, with sections for About, Services, Case studies (`Client, Event, City, Year: Role`), FAQ and Contact. Add `llms-full.txt` with the full text of every case study and the About and FAQ copy (small enough to be sensible at this size).

---

## 8. Cloudflare-facing notes (for Phase 3 checklist)
- Bot access is fine today. The things to re-check after deploy are Security > Bots (Bot Fight Mode off, or a skip rule for verified bots), AI Crawl Control (make sure it is not set to "block"), and that Cloudflare "managed robots.txt" is off. The live robots.txt currently matches the repo, so it is off.
- The crawler-logger Worker sits in front of all traffic. Confirm it passes the `X-Robots-Tag` headers from `_headers` through unchanged.

---

## Questions for Kimber

Answer whatever you can. Anything left blank stays out of the site.

### Identity and whole site
1. Trading name for the sole trader business: "Kimber Sykes", or something else? Can I delete the `Kimber Sykes Limited` constant?
2. Homepage H1: are you happy for it to read "Freelance Producer. Production. Technical." as one heading (same look), with the canonical one-liner as the first paragraph underneath?
3. Do you approve the canonical one-liner in section 4, or do you want to change the wording?
4. "23 years": what year did your career start (so the number can calculate itself)?
5. Real profiles for `sameAs` besides LinkedIn (Instagram, Crew/ProductionHUB, The Knowledge, IMDb, Companies House, etc.)?
6. Agency naming: should it be "We Are Wonder" or "Wonder" on the site?
7. Which clients or projects are under NDA or should not be named, if any?
8. Would you like the email and UK/US phone numbers in the schema (they are already public on /contact)?

### About page
9. A short factual career summary: key stages (e.g. Pulse Group era, Amplify era, K&K Productions in the Netherlands, Australia, freelance in London) with approximate years.
10. How agencies usually engage you: day rate, project fee, or both? Retained roles? Minimum booking?
11. Typical lead time you need, and whether you take short-notice work.
12. Travel: which countries you can work in without a visa sponsor (only if you want it stated), and whether you hold a driving licence or other relevant tickets (IPAF, first aid, SSSTS, etc.).
13. Any client or agency quotes you are happy to publish, with the name and title to attribute them to?

### Google Cloud Summit (2024, 2025, 2026)
14. Attendee numbers per year (the About page says 3,000, the 2024 case study says 4,000).
15. Is Tobacco Dock correct for all three years?
16. 2026: the number of rooms/stages, the size of your team, and anything measurable about the contractor check-in software (e.g. 1,000+ contractors processed in X days)?
17. Can the 2024 title become "Google Cloud Summit London 2024" (and the same for 2025/2026)? The role credits stay exactly as they are.

### Xerocon (Nashville, London, Denver)
18. Nashville: year and venue (Music City Center?), attendees.
19. London 2026: a figure to replace "several thousand".
20. Denver 2026: attendee count, number of stages, and your crew size.

### Consumer activations
21. Netflix: visitor numbers, supplier count, team size.
22. Canva: footprint, visitor numbers, duration of the pop-up.
23. Geely: team size, and what made the 37-projector blend hard.
24. Yoto: venue name, audience size, dimensions of the Yoto Player replica.
25. Stella McCartney COP28: footprint, duration, visitors.
26. Aperol: dates, footprint, footfall or engagement numbers.
27. MTV EMA: venue name (the site says "Wembley Theatre"), guest count.
28. Pixel 3: visitor numbers, team size.
29. EA Battlefront II: is "EA Sports" correct, or should it be "EA" / "Electronic Arts"? Stand size?
30. Samsung A5: the five cities.
31. J&J Mobile Lab: tour length, number of stops, audience reached.
32. Gunpowder Plot: opening year, capacity.

### Sport
33. Emirates tennis: the exact list of tournaments activated (ATP events vs Grand Slams) and the years.
34. Emirates Cricket World Cup: host cities and number of match days.
35. NTT Data: which Open (year, course)? The site currently says "London, UK".
36. Mastercard UCL and The Open: footprint, visitor numbers.
37. Aqua Rugby: dates and attendance.

### Other
38. Microsoft is on your client roster, and there are empty image folders for `microsoft-lcf` and `soundcloud`. Do you want case studies for these? If so, please send the details.
39. Brands on /clients with no case study (Sony, Diageo, AmEx, Disney and others): one line each on what you did and which agency it was through, if you're happy to share.
40. The CV PDF is dated May 2025 but named "2026". Is it current?
41. Do you want me to write real gallery alt text by looking at the photos?

---

## Proposed Phase 2 batches (after your go-ahead)
1. **Tech and schema:** `/work` SSR fix; titles; OG fields; dashes; lang; 404; `_headers`; robots; sitemap dates; the `@id` graph from one shared source; breadcrumbs; remove SearchAction; tidy the dead code. Then run the build and verify the HTML.
2. **Performance:** WebP/AVIF generation, hero `<picture>`, marquee preloads.
3. **llms.txt + llms-full.txt.**
4. **About page** as the entity page, plus the footer one-liner and the homepage intro.
5. **Case study restructure** (template plus the facts already on the site; gaps shown as questions, not invented).
6. **Service pages + FAQ.**
7. **Internal linking**, "last updated" dates, and the clients text lists.


---

## Change log

### Phase 2, batch 1: technical and structured data (29 Sep 2026)
- **`/work` now ships all 30 case study links in static HTML**, grouped under server-rendered H2s by sector (B2B tech conferences, Consumer brand activations, Sports sponsorship programmes). The `?q=` filter still works, read after hydration instead of via `useSearchParams`.
- **One identity source:** `data/site.json` holds name, roles, one-liner, meta description, base, contact, `sameAs`, `knowsAbout`. Read by pages (`lib/identity.ts`) and by the post-build schema script. `Kimber Sykes Limited` removed.
- **JSON-LD:** one `@graph` per page, injected into `<head>` post-build by `scripts/lib/schema-graph.mjs` (Person `#person`, ProfessionalService `#business`, WebSite `#website`, portrait `#portrait`, per-page WebPage/ProfilePage/CollectionPage/ContactPage/ItemPage, BreadcrumbList, and CreativeWork `#work` with the credit kept verbatim via a `Role`). Titles and descriptions in the graph are read from each page's own meta. `/work` carries an `ItemList` of all case studies. Removed the retired `SearchAction`, fixed `addressCountry` to `GB`, removed body JSON-LD and the old duplicate builders.
- **Titles:** static pages are `{Topic} | Kimber Sykes`; home is `Kimber Sykes | Freelance Executive Producer, Production Manager, Technical Director`; About is `About Kimber Sykes: Executive Producer, Production Manager, Technical Director`. Case study titles unchanged (credits as written).
- **Descriptions:** home meta shortened to 159 characters; case study descriptions now lead with project, client, place, year and the credit.
- **Homepage H1** now contains the role lines ("Freelance Producer. Production. Technical.") with the same look; `aria-hidden` removed.
- **Open Graph:** `og:site_name`, `og:locale en_GB` and image width/height on every page; About is `og:type profile`.
- **No em or en dashes** anywhere in rendered HTML, meta or JSON-LD (llms.txt is batch 3). "hers" fixed to "his".
- `lang="en-GB"`; custom 404 with a single `noindex`; RSC payloads (`/about.txt` etc.) get `X-Robots-Tag: noindex` via a generated `_headers` block.
- robots.txt adds Claude-SearchBot, Claude-User, Applebot, Bingbot; non-standard `Host:` removed.
- Sitemap: honest `lastmod` from the last git commit touching each page's sources (plus an optional per-project `updated` date); `llms.txt` removed from the sitemap.
- Verified: build passes, `tsc` clean, all 36 page graphs validate against the schema.org vocabulary with every `@id` reference resolving, one `<title>` per page, no dashes.

### Phase 2, batch 2: performance (29 Sep 2026)
- **Responsive WebP for every photo.** New prebuild step `scripts/optimize-images.mjs` (uses `sharp`, now a devDependency) writes 640/1280/1920px WebP variants of everything in `public/images/work` and `public/images/about` to `public/images/_opt/` (gitignored, only regenerated when a source photo changes; first run about a minute). Originals are untouched and still used for Open Graph and JSON-LD.
- **next/image custom loader** (`lib/image-loader.ts`, wired in `next.config.ts`) replaces `unoptimized: true`, so hero, card, gallery and portrait images now ship real `srcset`s. The case study hero keeps its high-priority preload, now as a responsive `imagesrcset`.
- Measured locally: the Aqua Rugby case study on a phone loads **103 KB** of images (was a 1.1 MB JPEG hero alone); the hero served on desktop is a 1920px WebP. The `/work` grid loads 150 KB of images above the fold.
- **Homepage logo preloads: 47 to 0.** Marquee logos are marked `fetchPriority="low"`, which stops React emitting a preload for each one; they still load eagerly, so the marquee looks the same. The homepage hero image is now the LCP element with nothing competing.
- `npm run dev` now runs the image step first (`predev`).

## Answers from Kimber (1 Oct 2026)
- **Google Cloud Summit London:** use "2,500+ attendees" for 2024, 2025 and 2026 (consistent everywhere). Tobacco Dock all three years. Titles become "Google Cloud Summit London 2024/2025/2026"; credits and URLs unchanged.
- **Emirates tennis:** ATP Finals at The O2, London (not Wimbledon), Roland Garros, Barcelona Open, US Open, Indian Wells, Rome.
- **NTT Data:** The Open Championship, Royal Liverpool, Hoylake, 2014.
- **MTV EMA after party (2017):** Fountain Studios, Wembley (former So You Think You Can Dance studios); 1,500 guests.
- **Battlefront II:** brand is "Electronic Arts", not EA Sports.
- **Career (confirmed 1 Oct 2026, as on the About page and CV):** 2003 to 2007 Everest Event Enterprises, Sydney; January 2008 to March 2011 t7 event solutions, Sydney; April to December 2011 Exposure, London; January 2012 to February 2015 Pulse Group, London (Emirates, NTT Data, dnata, Bentley); March 2015 onwards freelance for various agencies. (An earlier note here said 2003 to 2008 t7, 2012 to 2016 Pulse and freelance from 2016; Kimber confirmed the published dates are correct.)
- **Engagement:** publish nothing about pricing, rates, booking length or lead time. **No FAQ page at all.**
- **No testimonials. No NDA restrictions** (all clients can be named). **No profiles besides LinkedIn.**
- **New case study, Microsoft x London College of Fashion (2019, confirmed; not 2018):** Spitalfields Market, London; agency We Are Listen; role Technical Director. Worked with LCF students at the college to create technical solutions for exhibiting their major works using Microsoft technology; managed the installation of the event. Images in `public/images/work/microsoft-lcf`.
- **New case study, SoundCloud (2017):** ExCeL London; agency Amplify; role Lead Producer. Bespoke exhibition stand featuring SoundCloud's key products at a music conference; ran the whole project and supervised delivery of a bespoke web application that let guests explore the SoundCloud platform. Images in `public/images/work/soundcloud`.
- **CV (1 Oct 2026):** `public/Kimber Sykes - CV - 2026.pdf` rebuilt to match the site's credits (Aqua Rugby, Expo 2020, J&J, Gunpowder Plot, Parrtjima, Mastercard, Xerocon, Samsung), adding GCS London 2024 to 2026, Yoto, Aperol, Destination NSW, Microsoft x LCF, MTV EMA, Electronic Arts, SoundCloud; Microsoft and Yoto added to clients, Akcelo and K&K Productions to agencies; dashes and typos fixed. The InDesign source was not changed. GCS line on the CV reads "Senior Production Manager (2024-2026)" at Kimber's request; the site now matches (see below). Career start confirmed as 2003 (Everest Event Enterprises, Sydney, 2003 to 2007; t7 event solutions 2008 to 2011 per CV), so "23 years" stands.
- **Google Cloud Summit credit (1 Oct 2026):** at Kimber's instruction, all three years are now credited as **Senior Production Manager** on the site and CV (replacing "Technical" for 2024 and "Production Manager" for 2025). Titles renamed "Google Cloud Summit London 2024/2025/2026" (URLs unchanged), attendees "2,500+" everywhere, Tobacco Dock named for all three years, About page sentence corrected. Build and schema validation pass.
- **Gallery alt text:** skipped for now at Kimber's request (generic "event photograph N of M" alts remain).

### Phase 2, batch 3: llms.txt and llms-full.txt (1 Oct 2026)
- `scripts/generate-llms-txt.mjs` rewritten (prebuild). Both files are generated from `data/site.json`, `projects.json`, `clients.json`, `agencies.json`, `delivery-locations.json` and `map.json`, so they can't drift from the site. The script fails the build if an em or en dash appears.
- **llms.txt** (13 KB): the canonical one-liner, a short factual paragraph (23 years, 18 countries, London, agency model), a Profile block (roles, sectors, specialisms, all clients and agencies), key pages, and every case study grouped by sector with client, location, year and Kimber's credit stated verbatim. The nonexistent "contact form" link is gone.
- **llms-full.txt** (23 KB, new): the same header, the on-site delivery locations, and the full text of every case study with structured facts. Served as `text/plain` via `_headers`.
- Both files are now advertised on every page with `<link rel="alternate" type="text/plain">`. These links had been silently dropped before, because page-level `alternates` replaced the layout's.
- **Approved fact fixes applied to the data:** MTV EMA after party at Fountain Studios, Wembley, 1,500 guests; Battlefront II client renamed "Electronic Arts" (also on /clients and the map; the logo is the EA mark); NTT Data at Royal Liverpool, Hoylake, 2014 (map entry corrected from "British Open Golf, Troon, 2013"); Emirates tennis now the ATP Finals at The O2 in place of Wimbledon (case study and About page).

### Phase 2, batch 4: About page, homepage intro, footer (1 Oct 2026)
- **About is now the entity page.** H1 "About Kimber Sykes" (the "Why hire me" label is kept as a small kicker above it). It opens with the canonical one-liner, then question-shaped H2s with answer-first copy: "What does Kimber Sykes do?" (Executive Producer, Senior Production Manager, Technical Director, each with linked examples), "Which sectors does he work in?", "Where does he work?", **Career summary** (2003 to present, from the CV and Kimber's answers, stored in `data/site.json` → `career`), and the credentials summary. 17 links to case studies (each checked at build time), plus links to /where and /clients. Visible "Last updated" date (`aboutUpdated` in `data/site.json`). Meta description 158 characters. No pricing, rates, booking length, lead time or FAQ content.
- Corrections on About: the GCS sentence (Senior Production Manager, 2,500+, 2024 to 2026), tennis list (ATP Finals at The O2 in place of Wimbledon/"ATP London"), Electronic Arts, Yoto and Akcelo added.
- **Homepage:** the vague intro paragraph is replaced with the canonical one-liner; the About block now pulls roles and years from `data/site.json` and links to /about.
- **Footer** on every page: the short identity line ("Freelance Executive Producer, Production Manager and Technical Director. Based in London, working worldwide.").
- llms.txt and llms-full.txt now include the career summary.

### Phase 2, batch 5: case studies (1 Oct 2026)
- **New template** (`components/CaseStudySections.tsx`). Every case study now has a one-sentence summary under the H1 (credit, agency, event, place, year, scale where known), which is also the meta description and the JSON-LD `description`. Then up to five answer-first sections: *What was the brief?*, *Scale and constraints*, *What was Kimber responsible for?*, *Technical and production highlights*, *Outcome*. A section only renders when there are real facts for it. `updated` is set on every case study and published as `dateModified` in JSON-LD only (no visible date, at Kimber's request). The legacy `body` field stays in the data for search and fallback.
- **All 30 existing case studies rewritten** using only facts already on the site or supplied by Kimber. British spelling ("programme").
- **Two new case studies:** `/work/microsoft-lcf` (Technical Director for We Are Listen, Spitalfields Market, 2019) and `/work/soundcloud` (Lead Producer for Amplify, ExCeL London, 2017). Photos renamed to the site convention (`hero.jpg`, `01.jpg`...); the two duplicate SoundCloud photos were moved to `_to_delete/soundcloud-duplicates/`. Map entries updated.
- `scripts/optimize-images.mjs` now prunes WebP variants whose source photo was renamed or deleted.
- 32 case studies, 38 URLs in the sitemap. Build, schema validation and the no-dash check pass.

#### Gaps per case study (answer any time; each one strengthens the page)
- **GCS London 2024 / 2025 / 2026:** rooms or stages per year, your team size, any measurable outcome (attendee feedback, on-time load-in, zero incidents).
- **Xerocon London 2026:** delegate number to replace "several thousand". **Denver 2026:** delegates, crew size. **Nashville:** venue.
- **Yoto PlayDate:** venue name, audience size, replica dimensions.
- **Netflix:** visitor numbers, team size, supplier count. **Canva:** footprint, visitors, duration. **Geely:** team size. **Pixel 3:** visitors, team size.
- **Visa Everywhere:** venue, attendees. **Aperol:** dates, footprint, footfall. **Stella McCartney COP28:** footprint, duration, visitors.
- **MTV EMA, EA Battlefront II, SoundCloud:** stand or room size, visitor numbers, the name of the music conference (SoundCloud).
- **Mastercard UCL and The Open:** footprint, reach. **Emirates Cricket World Cup:** host cities, match days. **NTT Data:** screen size or spec.
- **J&J Mobile Lab:** tour length, number of stops, audience. **Expo 2020:** team size. **Samsung:** the five cities. **Parrtjima:** number of works.
- **Destination NSW:** broadcaster and air dates. **Rizlab:** venues, number of shows. **Aqua Rugby:** dates, attendance. **Gunpowder Plot:** opening year, capacity.
- **Microsoft x LCF:** number of students or works exhibited, the Microsoft technologies used (e.g. HoloLens, Surface Hub are visible in the photos; confirm before publishing).

## Research: proposed facts from public sources (1 Oct 2026, awaiting Kimber's approval)
Nothing below is on the site yet. Sources were checked on 1 Oct 2026.
1. Xerocon London 2026: 2,200 delegates; Grand Hall, Olympia; 8 and 9 July 2026; 70 m immersive LED environment; four simultaneous Discovery Stages with silent-conference headphones; 40 m indoor slide; giant ball pit; reusable scenic shipped from Brisbane in two 20 ft containers. (lbbonline.com/work/175601; olympia.co.uk/events/xerocon-london)
2. Xerocon Denver 2026: 19 and 20 August 2026; stages: Supercharge, Discovery, App Spotlight, new peer-led Partner stage. (thefirm.media; denverconvention.com)
3. Xerocon Nashville: Music City Center, 14 and 15 August 2024. (cpapracticeadvisor.com)
4. Canva Studio London: at Hello Love (Bloomsbury); 1,200 live attendees over three days; 13,000+ unique page views; 300K+ organic social reach; 300% lift in UK paid social CTR; marked Canva's EMEA launch and London HQ; build by madeWORKSHOP; mural by Geo Law. (jackmorton.com/work/studio-london; madeworkshop.co.uk) CONFLICT: site says Holborn.
5. Netflix Stranger Things Festival: public dates 26 to 29 May 2022; 10,000 free tickets; 1,000 sqm. (sortiraparis.com; freenews.fr) CONFLICT: site says six-day event.
6. Geely EX5: Luna Park's Big Top, first automotive launch there; 400+ guests; media drive in the Southern Highlands; week-long dealer training on Sydney's northern beaches; April 2025. (bandt.com.au)
7. Pixel 3 Curiosity Rooms: 55 Regent Street, the former Tower Records at Piccadilly Circus; five-week residency. (weareamplify.com)
8. Aperol: 55 sqm in T2 Departures; two-month run; digital trivia game; digital sunset photo experience; with Lotte Duty Free; plus an arrivals store activation. (trbusiness.com)
9. Stella McCartney COP28: 30 Nov to 12 Dec 2023; 15+ material innovators; space 3D printed with PURE.TECH carbon-absorbing material. (stellamccartney.com; dezeen.com)
10. MTV EMA 2017 after party: Amplify's case study says 1,700 guests at "Wembley Theatre (former home to X Factor)", theme "It's a London Thing", tube carriage via Village Underground as DJ booth backdrop, DJ EZ, Manny Norte, Ray BLK. (weareamplify.com) CONFLICT: Kimber said 1,500 guests.
11. Battlefront II: Paris Games Week 1 to 5 November 2017, 300,000+ visitors. (programmez.com)
12. Emirates Aviation Experience: opened July 2013 beside the cable car at North Greenwich. (londonist.com) CONFLICT: Londonist reported a £4 million attraction (site says £7m); the Rolls-Royce Trent 900 engine was added in a later revamp (adsadvance.co.uk), not at opening.
13. J&J: VELYS Digital Surgery Mobile Lab (DePuy Synthes and Johnson & Johnson Institute), launched Sydney 20 Oct 2021; semi-trailer with meeting, training and lab space; VR operating environments; 3D-printed surgical models. (jnjmedtech.com) Note: no source mentions solar.
14. Expo 2020: projection surface was the Al Wasl Plaza dome; 252 Christie 4K laser projectors in 42 pods. (christiedigital.com)
15. Parrtjima 2021: 9 to 18 April 2021, ten nights, theme "Future Kultcha", curated by Rhoda Roberts AO. (russh.com)
16. The Long Road: Guy Sebastian, Amy Shark, Ocean Alley; hosted by Ash London; Dec 2020. (mumbrella.com.au) CONFLICT: Mumbrella calls it a "six-part web series"; site says TV series with national TV distribution.
17. Rizlab: first event "Structures" with Jamie xx and Quayola at Classic Car Club, Old Street, September 2011. (thedailystreet.co.uk)
18. Aqua Rugby 2024: BSc Energy Aqua Rugby Festival, 11 to 13 April 2024; ambassadors incl. Wendell Sailor, Bernard Foley, Drew Mitchell; men's and women's divisions; free viewing from shore plus VIP hospitality. (manofmany.com)
19. Gunpowder Plot: opened 6 May 2022 at the Tower Vaults next to the Tower of London; created by Layered Reality (formerly dotdotdot) with Historic Royal Palaces; live actors, VR, projection mapping. (blooloop.com) CONFLICT: site says 2020, "beneath the Tower", independent; CV said Project Lead for Ellipsis and lists dotdotdot.
20. Microsoft x LCF: "Accelerating the Future of Fashion" student exhibition, 4 June 2019, Old Spitalfields Market; six student teams; Mixed Reality (HoloLens), AI (Azure Cognitive Services) and IoT. (arts.ac.uk)
21. SoundCloud: the event was BBC Music Introducing hosts Amplify 2017, ExCeL London, October 2017, 15,000+ tickets; SoundCloud hosted a panel with CEO Kerry Trainor. (iamhiphopmagazine.com)
22. Visa Everywhere Women's Global Edition: final 7 June 2019 in Paris, opening week of the FIFA Women's World Cup; 12 finalists. (usa.visa.com) Venue not found.
Not found publicly: GCS rooms and team size, Mastercard UCL and Open footprint, Emirates CWC host cities, NTT Data 2014 spec, Samsung tour cities, Yoto 2026 venue (The Park's page covers the 2025 edition at White Rabbit Studios with a different agency).

### Old URLs returning 404
Search results still list old site URLs that now 404: `/rizler`, `/aqua-rugby-australia`, `/bbraun`. Proposed 301s: `/rizler` → `/work/rizla`, `/aqua-rugby-australia` → `/work/aqua-rugby`, `/bbraun` → `/clients`. Check Search Console (Pages, Not found) for any others.
- **Conflicts resolved by Kimber (1 Oct 2026), applied:** Netflix "six-day event" includes press and influencer days; MTV EMA after party 1,700 guests; Emirates Aviation Experience stays £7 million, and the later revamp (A380 simulators, AR, Rolls-Royce Trent 900 engine) was also Kimber's work, now described as such; Gunpowder Plot is 2022 for dotdotdot, at the Tower Vaults next to the Tower of London (site, map and CV updated); The Long Road is a six-part web series (site and CV updated); Canva Studio was in Bloomsbury.

### Phase 2, batch 6: researched facts, redirects, services on the Why page (1 Oct 2026)
- **All 22 researched facts applied** (see "Research" above), including the Netflix public dates, tickets and floor area, and the Canva outcome figures. J&J keeps "solar powered" from the original copy.
- **Redirects** in `public/_redirects`: `/rizler` → `/work/rizla`, `/aqua-rugby-australia` → `/work/aqua-rugby`, `/bbraun` → `/clients` (301). The crawler-logger Worker uses `redirect: "manual"`, so 301s pass through to visitors.
- **Services on the About ("Why") page:** "How can Kimber help your agency?" replaces "What does Kimber Sykes do?". It has three anchored sections (`/about#executive-production`, `#production-management`, `#technical-direction`), each with an answer-first paragraph, "What's included", typical projects and linked case studies. Copy lives in `data/site.json` → `services`. No pricing, rates, booking length or FAQ.
- **Schema:** three `Service` nodes on /about (provider `#business`, `subjectOf` their case studies); the business gets `makesOffer` there.
- **Linking:** every case study listed under a service shows a "Related service" link back to its anchor; the homepage About block links to all three; llms.txt and llms-full.txt have a Services section.
- Build, schema validation (all 38 pages) and the no-dash check pass.

## Phase 3: verification (1 Oct 2026)
- Clean build from scratch (image variants regenerated, 798 files): passes. TypeScript clean. ESLint: no errors in any file changed in this work. Three errors exist in untouched files (`functions/api/kimber-now.ts` prefer-const x2, generated `next-env.d.ts`); `next build` passes regardless.
- 39 HTML pages (38 in the sitemap plus the 404). Every internal link and `#anchor` resolves; every image and srcset variant exists. One H1 per page, no heading-level jumps, every `<img>` has alt text.
- No duplicate titles or descriptions; all descriptions ≤160 characters (Clients, Where and Work trimmed in this pass). Long-ish titles (72 to 83 characters) on home, About and five case studies are kept deliberately for entity clarity.
- No em or en dashes and none of the retired facts (Wimbledon, EA Sports, 4,000, 3,000 PAX, Holborn, Wembley Theatre, TV series) anywhere in rendered HTML, llms.txt, llms-full.txt or robots.txt.
- JSON-LD on all 38 pages validates against the schema.org vocabulary with every `@id` resolving.
- Browser QA on all 39 routes at 390 px and 1440 px: no console errors, no failed requests, no horizontal overflow. `/work?q=` filter and `/about#...` anchors work.
- Windows compatibility of new scripts reviewed (path handling, `git` via execFileSync, `sharp` win32 binary already in node_modules).
- `_to_delete/` added to `.gitignore` so preview tarballs and old files can never be committed.
- Batch 7 (text lists under the Clients logos) is not done; it's optional and can follow after go-live.

## Phase 4: follow-up (1 Oct 2026)
- Kimber confirmed Google Cloud Summit London 2024, 2025 and 2026 are all **Senior Production Manager**, and that the published career dates are correct (see the note at the top of this file).
- `portrait.jpg` is now tracked in git (`.gitignore` line scoped to `/portrait.jpg`).
- The client is named in every case study title, H1, `/work` tile and schema name (the `project` field in `data/projects.json` and `data/map.json`; credits and URLs unchanged).
- `/work` loads its first two cards with priority: mobile LCP fell from 4.9 s to about 3.5 s in a throttled local test.
- Measured results found in public sources (listed in `site-audit-2.md`, Follow-up) were approved by Kimber and applied to Pixel 3, Emirates Aviation Experience, Parrtjima, MTV EMA, The Gunpowder Plot, Visa, Microsoft x LCF, Expo 2020, Google Cloud Summit London 2026 and Xerocon Denver. Battlefront II gains "64 consoles". Xerocon Nashville now says "more than 1,000" attendees (was "around 3,000").
- Released 1 Oct 2026: commit `2fc83aa`, deployed with `npm run pages:deploy` and pushed to GitHub. Live checks passed (titles name the client, new facts live, portrait and llms files return 200 to ClaudeBot); live `/work` mobile LCP 2.6 to 2.8 s, down from 4.1 s.
- Documentation updated to match: `docs/CONTENT.md` (case study fields, the client-in-title rule, writing rules, current counts, SEO and AI files), `docs/ARCHITECTURE.md` (image pipeline, `/work` priority cards, schema and llms generation), `docs/DEPLOY.md` (who deploys, post-deploy checks), `docs/README.md` (links to both audits). Dashes removed from those files.
