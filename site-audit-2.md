# kimbersykes.com: SEO and AI answer engine audit 2 (BEFORE vs AFTER)

Audited 1 October 2026. No code was changed. This file is the only addition to the repo.

- **BEFORE:** commit `444d42b`, cloned to a separate folder and built from scratch (`npm ci`, `npm run build`).
- **AFTER:** commit `b701da7` (current `master`), cloned and built the same way, plus the live site at https://kimbersykes.com.

`site-audit.md` was read for context only. Every claim below comes from the built HTML, the repo data, or live `curl` and browser tests. Where my findings disagree with `site-audit.md`, that is called out in section 4.

## Follow-up, 1 October 2026 (after Kimber's go-ahead)

### Decisions from Kimber
- **Google Cloud Summit London 2024, 2025 and 2026: Senior Production Manager for all three years.** This is final. The repo documentation now says the same: `site-audit.md`, `CLAUDE_AI_SEO_AUDIT_SUMMARY.md` and `docs/brief.md`. The CV already read "Senior Production Manager (2024-2026)". Questions 1 and 5 in section 6 are closed on the credit. The 2024 page keeps its existing responsibilities (all audio-visual elements across the experiential areas, AI activations and exhibitor stands), because no other facts were supplied.
- **Career dates are as published:**

  | Years | Organisation | Location |
  |---|---|---|
  | 2003 to 2007 | Everest Event Enterprises | Sydney |
  | January 2008 to March 2011 | t7 event solutions | Sydney |
  | April to December 2011 | Exposure | London |
  | January 2012 to February 2015 | Pulse Group | London |
  | March 2015 to present | Freelance | Worldwide |

  The About page, llms.txt, llms-full.txt and the CV already matched these dates. The conflicting note in `site-audit.md` has been corrected. Question 2 is closed.

### Changes made (code)
1. **Portrait tracked in git.** In `.gitignore`, line 14 changed from `portrait.jpg` to `/portrait.jpg`, so it only ignores a scratch file at the repo root. `public/images/about/portrait.jpg` is now tracked, so a clean build has the About portrait, the `og:image` and the schema image.
2. **The client is named in every case study title, H1, `/work` tile and schema name.** Only the `project` field changed. Credits, URLs and slugs did not change. Old to new:

   | Old project name | New project name |
   |---|---|
   | Stranger Things Fan Experience | Netflix Stranger Things Fan Experience |
   | EX5 Brand Launch | Geely Auto EX5 Brand Launch |
   | Xerocon Nashville | Xerocon Nashville 2024 |
   | Australian Open | Aperol Spritz at the Australian Open 2024 |
   | Sustainable Market at COP28 | Stella McCartney Sustainable Market at COP28 |
   | UEFA Champions League Final | Mastercard at the UEFA Champions League Final |
   | British Open Golf | Mastercard at The Open, Royal Troon |
   | EMA Awards After Party | MTV EMA Awards After Party |
   | Exhibition Stand at ExCeL London | SoundCloud Stand at ExCeL London |
   | Global Sports Sponsorship Programme | Emirates Global Sports Sponsorship Programme |
   | Cricket World Cup | Emirates at the Cricket World Cup 2015 |
   | Battlefront II Launch | Electronic Arts Battlefront II Launch |
   | Mobile Laboratory | Johnson & Johnson VELYS Mobile Lab |
   | UAE National Day Celebration | Expo 2020 UAE National Day Celebration |
   | Galaxy A5 Launch Tour | Samsung Galaxy A5 Launch Tour |
   | Parrtjima Festival | Parrtjima Festival for Tourism NT |
   | The Long Road | The Long Road for Destination NSW |
   | Rizlab | Rizlab: Experiments in Music |
   | Darling Harbour Festival | Aqua Rugby Australia Festival at Darling Harbour |
   | Immersive Theatre Experience | The Gunpowder Plot Immersive Theatre Experience |

   - Example title: `Aperol Spritz at the Australian Open 2024, Executive Producer | Kimber Sykes`.
   - `data/map.json` was updated to match.
   - The tiles and captions now hide the separate client line when the project name already contains it, so "Netflix" isn't shown twice.
   - Schema `alternateName` and the `/work` `ItemList` names no longer repeat the client (`scripts/lib/schema-graph.mjs`).
3. **`/work` loads faster on phones.** The first two cards are now `priority` (eager, preloaded). They are the cards above the fold on a phone, and they include the LCP image. All other cards stay lazy (`components/WorkProjectList.tsx`, `components/ProjectCard.tsx`).

   Measured on a local copy of each build, with the same throttling as in 3.7 (390 px wide, DPR 3, 1.6 Mbps, 150 ms latency, 4x CPU), median of 3 runs:

   | Page | Before | After |
   |---|---|---|
   | `/work` | 4.9 s | 3.4 to 3.5 s |
   | Home | 1.5 s | 1.5 s |
   | `/work/aqua-rugby` | 4.8 s | 4.8 s |

   The remaining time on `/work` is bandwidth shared between the first card (a 1280 px WebP that a DPR 3 phone requests), fonts and the framework JavaScript.

**Verification:** clean build passes; no em or en dashes in any built page, llms file or sitemap; every JSON-LD `@id` resolves; no doubled client names anywhere in the output. Not deployed yet.

### Measured results found in public sources (approved by Kimber and applied, 1 Oct 2026)
Kimber approved every fact below. All are now in `data/projects.json` and flow through to the pages, llms.txt, llms-full.txt and the schema. Each fact is worded as its source states it.

| Case study | Proposed fact | Source |
|---|---|---|
| Google Pixel 3 Curiosity Rooms | More than 71,000 visitors, average dwell time 21 minutes; 83% took part in the experiences; 80 million+ reached online through nine media partners; 36 live events. Campaign Experience Awards: **Grand Prix**, plus Gold for Best Integrated Experience, Best Collaboration, Best Production Experience and Best Food Experience, Silver for Bravest Campaign, and Bronze for Best Digital Experience and Creative Event of the Year | [Amplify](https://www.weareamplify.com/news/google-s-curiosity-rooms-wins-the-grand-prix) |
| Emirates Aviation Experience | 120,000 annual visitors; 4,500 students and 250 schools a year | [Pulse Group](https://www.pulsegroup.com/our-work/emirates-aviation-experience) (undated) |
| Parrtjima 2021 | More than 23,000 attendances over the ten nights | [KarryOn](https://karryon.com.au/lifestyle/parrtjima-2021-the-festival-lighting-the-way-for-2022/) |
| MTV EMA After Party | 25+ hours of creative content produced (1,700 guests and 10 artists are already on the page) | [Amplify](https://www.weareamplify.com/work/global/mtv-ema-awards-afterparty) |
| The Gunpowder Plot | blooloop Innovation Awards 2022: second place for Immersive Experience and for Storytelling; 25,000 sq ft of vaults; five stars from The Times | [blooloop](https://blooloop.com/innovation-awards/2022/project/the-gunpowder-plot-layered-reality/) |
| Visa Everywhere Initiative | Nearly 1,300 applicants for the Women's Global Edition; two category winners, each awarded US$100,000 | [Branding Forum](https://brandingforum.org/marketing/visa-everywhere-initiative-winners/) |
| Microsoft x LCF | Projects developed over three months; six projects; technology also included Kinect sensors and OLED screens | [Forbes](https://www.forbes.com/sites/brookerobertsislam/2019/06/18/accelerating-the-future-of-fashion-creatives-deliver-much-needed-tech-disruption/) |
| Expo 2020 | The show was "Journey of the 50", run 1 to 4 December 2021, twice nightly (7:30 pm and 10:15 pm) | [The National](https://www.thenationalnews.com/uae/expo-2020/2021/11/24/expo-2020-dubai-to-entertain-crowds-with-spectacular-four-day-jubilee-celebrations/) |
| Google Cloud Summit London 2026 | 2,000+ attendees a day over two days; Tobacco Dock's 16,000 sqm across 50 spaces; four-day load-in and build; 100+ Creative Technology technicians on site (CT was Wonder's technical production partner) | [Creative Technology](https://ct-group.com/de/en/projects/technical-production-google-cloud-summit-london-2026/) |
| Xerocon Denver 2026 | 45+ exhibitors | [The Firm](https://www.thefirm.media/articles/xerocon-denver-2026-recap/) |
| Xerocon Nashville 2024 | **Resolved:** the site now says "more than 1,000" attendees (confirmed by Kimber; replaces "around 3,000") | [CPA Practice Advisor](https://www.cpapracticeadvisor.com/2024/08/14/xero-showcases-new-tech-and-integrations-at-xerocon-2024-conference-in-nashville/109050/) |
| Battlefront II | 64 consoles running Battlefront II for multiplayer play (confirmed by Kimber as his activation) | [JeuxActu](https://www.jeuxactu.com/paris-games-week-2017-la-liste-des-jeux-ea-presents-sur-le-salon-111285.htm) |
| Geely Auto EX5 | **Not used:** a supplier case study reports 250 delegates on 11 March 2025, which looks like a different Geely event from the April Luna Park launch | [Congress Rental](https://www.congressrental.com.au/case-study/geely-ex5-launch-event-2025) |

**No public measured results found** for these case studies (searched 1 Oct 2026):
- Aperol Spritz, Stella McCartney (beyond the 15 innovators already on the page), J&J VELYS Mobile Lab, Samsung Galaxy A5
- Mastercard UCL Final and The Open, Emirates Cricket World Cup and the global sports programme
- NTT Data 2014, Aqua Rugby 2024 attendance, Yoto PlayDate 2026, SoundCloud at Amplify 2017
- Netflix Stranger Things (beyond the tickets and floor area already on the page), Xerocon London 2026 (beyond what is on the page), Destination NSW (the Havas case study page could not be fetched)
- Google Cloud Summit London 2024 and 2025

Canva and Rizlab already carry their published outcomes. For the rest, the figures can only come from you.

---

## 1. Summary table

| Category | Max | BEFORE | AFTER | Change |
|---|---|---|---|---|
| Crawlability and AI crawler access | 15 | 9 | 14 | +5 |
| Technical SEO | 15 | 7 | 13 | +6 |
| Structured data and entity graph | 15 | 5 | 13 | +8 |
| Entity consistency | 10 | 3 | 8 | +5 |
| Content depth and specificity | 20 | 8 | 13 | +5 |
| AEO readiness | 15 | 4 | 12 | +8 |
| Performance and accessibility | 10 | 4 | 7 | +3 |
| **Total** | **100** | **40** | **80** | **+40** |

In one line: the overhaul fixed the structural problems (an empty `/work` page, a disconnected schema, no identity statement, thin llms.txt). What holds the score back now is the content itself: case study titles that don't name the client, and missing scale and outcome facts that only you can supply.

---

## 2. How each version was tested

| Test | BEFORE | AFTER |
|---|---|---|
| Clean build from git | Yes (31 HTML files with JSON-LD) | Yes (38 HTML files with JSON-LD, plus 404) |
| Static HTML parsed (titles, metas, headings, links, images, JSON-LD) | Yes | Yes |
| JSON-LD `@id` resolution across all pages | Yes | Yes |
| Live HTTP status for 12 user agents | Not possible (BEFORE is no longer deployed) | Yes, 8 URLs each |
| Live HTML compared with the clean build | n/a | Yes |
| Throttled browser test (LCP, bytes) | n/a | Yes, Playwright Chromium |

**Live = master?** Yes. On 1 October 2026, `llms.txt`, `llms-full.txt`, `robots.txt` and `sitemap.xml` on the live site are byte-identical to my clean `master` build (matching MD5). The visible text of 9 sampled pages is identical. There are two differences, both caused by your local working folder, not by git:
1. The About page has a working "Download professional portfolio" link live. It comes from `.env.production`, which is correctly gitignored.
2. The live JSON-LD and `og:image` carry `width 1200` and `height 1600` for the portrait. In a clean build they are missing because **`public/images/about/portrait.jpg` is not in git** (see AFTER, Technical SEO).

**Limitation:** I couldn't re-test live bot access for BEFORE. My scoring for BEFORE uses the same Cloudflare and Worker setup, with robots.txt as built.

---

## 3. Category scores with evidence

### 3.1 Crawlability and AI crawler access (15)

**BEFORE: 9 / 15**
- `robots.txt` allows `*` and names 23 bots. **Claude-SearchBot, Claude-User, Bingbot and Applebot are not named** (they are still allowed through `*`). It also has a non-standard `Host: kimbersykes.com` line. (-1)
- **`/work` contains no case study links in its static HTML.** `out/work.html` has 50 words, the H1 "What I have delivered" and 0 `href="/work/..."` links. The list is client-rendered. (-4)
- Case studies can only be found through the sitemap, the 4 homepage feature cards and the prev/next chain (each case study page has 2 `/work/` links). They are crawlable, but only weakly.
- The RSC payloads (`/about.txt`, `/work/*.txt`) are served as text with no `noindex`. (-1)
- All other key content is in the static HTML. There is no `<link rel="alternate">` to llms.txt.

**AFTER: 14 / 15**
- Live status, 1 October 2026, from a cloud IP. These 8 URLs were tested with each user agent: `/`, `/about`, `/work`, `/work/geely-auto`, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml`:

  | User agent | Result |
  |---|---|
  | Chrome desktop, ClaudeBot, Claude-SearchBot, Claude-User, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Googlebot, bingbot, Applebot, CCBot | **200 on all 8 URLs** |

- `robots.txt` now names Claude-SearchBot, Claude-User, Applebot and Bingbot, and the `Host:` line is gone. The sitemap is referenced.
- `/work` static HTML: 836 words, **32 `/work/` links**, under three H2s (B2B tech conferences, Consumer brand activations, Sports sponsorship programmes).
- RSC payloads: `curl -I https://kimbersykes.com/about.txt` returns `x-robots-tag: noindex`.
- Every page has `<link rel="alternate" type="text/plain">` pointing to `llms.txt` and `llms-full.txt`.
- **Cost (-1):** a few internal pathways still need JavaScript or don't exist:
  - `/where` has an H2 "Where is Kimber Right Now?" with an empty body in the static HTML (it is filled client-side), and the map is client-side.
  - `/clients` logos don't link to the case studies.
  - `/where` cities don't link to the case studies (the page has 6 internal links, all nav).
- Note: real bot traffic comes from verified bot IP ranges, which Cloudflare treats differently from a cloud IP. Recheck Cloudflare **Security > Bots** and **AI Crawl Control** after each deploy.

### 3.2 Technical SEO (15)

**BEFORE: 7 / 15**
- **Titles:**
  - Five static pages leave out your name, e.g. `About [em dash] Executive Producer & Production Manager` and `Portfolio [em dash] Corporate Events & Brand Activations`. (-2)
  - Em dashes appear in 74 built files.
- **Descriptions:** many are over 160 characters. Home is 181, Where 220, GCS 2026 436, J&J 279, Xerocon London 287. Several don't mention you, e.g. Visa: "The Visa Everywhere Initiative is a global innovation program..." (-2)
- **Sitemap:** all 37 URLs share the build timestamp `2026-10-01T04:44:43.331Z`, and `llms.txt` is listed as if it were a page. (-1)
- **404:** the default Next.js page. Its parsed title is `404: This page could not be found.Kimber Sykes [em dash] Freelance...` (two titles). (-1)
- **Headings:** the homepage H1 is the single word "Freelance". The About H1 is "Why hire me". (-1)
- **Open Graph:** `og:site_name` and `og:locale` are missing on every page except the 404. (-1)
- `lang="en"`.
- Fine already: canonicals are absolute; www returns a 301 to the apex; a trailing slash and `.html` return a 308 to the clean URL.

**AFTER: 13 / 15**
- **Titles:** every static page has `{Topic} | Kimber Sykes`. Home is `Kimber Sykes | Freelance Executive Producer, Production Manager, Technical Director` (83 characters, so Google will truncate it).
- **Descriptions:** all 156 characters or fewer on indexable pages. No duplicates, apart from the 404, which is `noindex`. Case study descriptions now lead with the credit, e.g. `Executive Producer for INVNT on the Geely Auto EX5 launch in Sydney, 2025, ...`.
- No em or en dashes in any built `.html`, `.txt` or `.xml` file (0 files). `lang="en-GB"`. One H1 per page on all 39 pages.
- **Open Graph and Twitter:** complete, with `og:site_name`, `og:locale en_GB`, image dimensions and `og:type profile` on About.
- **Redirects (live):**
  - `/rizler` returns a 301 to `/work/rizla`.
  - `/aqua-rugby-australia` returns a 301 to `/work/aqua-rugby`.
  - `/bbraun` returns a 301 to `/clients`.
  - The www, trailing slash and `.html` redirects still work.
- **404:** unknown URLs return a real 404 with the title `Page not found | Kimber Sykes` and a single `noindex`.
- **Sitemap:** 38 URLs with no llms.txt. `lastmod` comes from git, so today all 38 show `2026-10-01T04:23:32.000Z` (the overhaul commit touched every page). This is honest, and it will differentiate after the next content edits.
- **Cost (-1): case study titles and H1s don't name the client on about half the pages.** The client only appears as a small label above the H1. Examples:

  | Page | Current title |
  |---|---|
  | `/work/aperol-spritz` | `Australian Open, Executive Producer \| Kimber Sykes` (no "Aperol") |
  | `/work/johnson-johnson` | `Mobile Laboratory, Executive Producer \| Kimber Sykes` |
  | `/work/gunpowder-plot` | `Immersive Theatre Experience, Executive Producer \| Kimber Sykes` |
  | `/work/soundcloud` | `Exhibition Stand at ExCeL London, Lead Producer \| Kimber Sykes` |
  | `/work/aqua-rugby` | `Darling Harbour Festival, Executive Producer \| Kimber Sykes` |

  The same pattern applies to EX5, Cricket World Cup, British Open Golf, UEFA Champions League Final, UAE National Day Celebration, Battlefront II, EMA, COP28, Galaxy A5 and the Global Sports programme.
- **Cost (-1): `portrait.jpg` is gitignored.** Line 14 of `.gitignore` is the bare pattern `portrait.jpg`, which matches `public/images/about/portrait.jpg`. It is the only ignored source file the site needs. A fresh clone or CI build therefore ships:
  - an About portrait with no source file;
  - an `og:image` and `#portrait` JSON-LD image that would 404;
  - no WebP variants for the portrait.

  The live site is fine only because it was built from your working folder.

### 3.3 Structured data and entity graph (15)

**BEFORE: 5 / 15**
- **Home:** three separate `<head>` blocks (`Person`, `WebSite` with a `SearchAction` pointing at client-side search, and `ProfessionalService`), with **no `@id`s**.
- **About and Contact:** the `Person` is in `<body>`. Contact has a `ContactPage` with a second anonymous `Person`. `/work` has a `CollectionPage` with no items. Clients and Where have no schema.
- **Case studies:** a `CreativeWork` with an anonymous `creator: {Person, jobTitle}` each time, `publisher` set to the agency, `sponsor` set to the client, `about` as a plain string, and no `url` or `image`. Example (Geely): `"publisher":{"@type":"Organization","name":"INVNT"}`.
- `addressCountry: "UK"` should be `"GB"`. No BreadcrumbList, no Service markup.
- No review or rating schema, which is good.

**AFTER: 13 / 15**
- **One `@graph` per page in `<head>`:**
  - `Person #person`, with `jobTitle` (3 roles), the canonical `description`, `hasOccupation` (x3), `knowsAbout`, `sameAs` (LinkedIn), `worksFor #business` and `mainEntityOfPage` pointing to `/about#webpage`;
  - `ProfessionalService #business`, with `founder` and `employee` set to `#person`;
  - `WebSite #website`, with `publisher` and `about` set to `#person`;
  - `ImageObject #portrait`;
  - a page node for each page type (`ProfilePage`, `CollectionPage` with an `ItemList` of 32, `ItemPage`, `ContactPage` or `WebPage`), plus a `BreadcrumbList` on every non-home page.
- **Case study example** (`/work/geely-auto#work`): `CreativeWork` with `name`, `alternateName`, `url`, `image` (1920x1080), `dateCreated`, `producer` (the agency), `sponsor` (the client), `genre`, `isPartOf` and `mainEntityOfPage`. The credit is kept verbatim through `creator: {"@type":"Role","roleName":"Executive Producer","creator":{"@id":".../#person"}}`.
- **About** has three `Service` nodes (`provider #business`, with `subjectOf` pointing to the case studies) and `makesOffer` on the business.
- **Resolution check:** I collected every `@id` reference across all 39 built pages, and **0 references are unresolved** site-wide. All JSON parses. `addressCountry` is `GB`. There is no `SearchAction`, no review and no rating.
- **Costs (-2):**
  - The event behind each case study is not modelled. `locationCreated` is a bare `Place` named "Sydney, Australia", even where the page names the venue (Luna Park Big Top, Tobacco Dock, Olympia Grand Hall, Music City Center, Cirque d'Hiver, Old Spitalfields Market, ExCeL, Royal Liverpool). Clients and agencies are bare `Organization` names with no `url`.
  - `CreativeWork.name` is the project label without the client (e.g. "Australian Open"), so only `alternateName` ties Aperol to the page.
  - Minor:
    - `Person.email` is `mailto:kimber@...` but `ProfessionalService.email` is a bare address.
    - The home `WebPage @id` is `https://kimbersykes.com#webpage` (no slash), while the other nodes use `https://kimbersykes.com/#...`. It still resolves, but the style is inconsistent.
    - `dateModified` is `2026-10-01` on every case study.

### 3.4 Entity consistency (10)

**BEFORE: 3 / 10**
- Your description is worded differently in the home title, home meta, home intro ("Events professional specialising in..."), the home About block, the Person schema, llms.txt and About. The footer has no identity line at all.
- `lib/contact.ts:9` has `COMPANY_NAME = "Kimber Sykes Limited"`, which contradicts sole trader status.
- `components/KimberRightNow.tsx:302` says "Kimber is outside **hers**".
- **Contradictions on the page:**
  - About says "Production Manager for Google Cloud Summit for a 3,000 PAX conference over the last three years", while GCS 2024 says "Technical" and "4,000 attendees".
  - The ATP list includes Wimbledon.
  - NTT Data is located in London.
- The homepage H1 is "Freelance".

**AFTER: 8 / 10**
- **The canonical one-liner is used word for word** in:
  - the Person `description`;
  - the home intro paragraph;
  - the first paragraph of About;
  - the `llms.txt` blockquote.

  The short line ("Freelance Executive Producer, Production Manager and Technical Director. Based in London, working worldwide.") is in the footer of every page, the `WebSite` description and the `ProfessionalService` description. The meta descriptions are close paraphrases.
- `Kimber Sykes Limited` and "hers" are gone. There is no Wimbledon, "EA Sports'", "4,000 attendees", "3,000 PAX", Holborn, "Wembley Theatre" or "TV series" anywhere in the built output (grep returned 0 files).
- **Costs (-2):**
  1. **The career dates don't match your recorded answers.** About and llms.txt say "2015 to present Freelance" and "2012 to 2015 Pulse Group". `site-audit.md` ("Answers from Kimber, 1 Oct 2026") says "2012 to 2016 Pulse Group ... 2016 onwards freelance". The same answers also say "2003 to 2008 t7 event solutions", but the site says t7 ran 2008 to 2011 and Everest ran 2003 to 2007.
  2. **The client count doesn't match.** The homepage stat says **48** clients, which is 47 logos plus "Arise Fashion" from `lib/marquee.ts`. `/clients` shows 47 brands, and llms.txt lists 47 with no Arise Fashion. An AI engine that compares the two will see 47 vs 48.
  3. **Agency naming.** The site says "Wonder" on 70+ occasions and never "We Are Wonder". This was open question 6 in `site-audit.md` and is still unanswered.
  4. **Role wording.** The identity says "Production Manager", but no case study now carries that credit: all three GCS years are "Senior Production Manager", and the About service uses "As Senior Production Manager". This is defensible, but worth a decision.
  5. **GCS 2024 narrative.** Its responsibilities ("Delivered all audio-visual elements across the experiential areas") were written for the old "Technical" credit and now sit under "Senior Production Manager".

### 3.5 Content depth and specificity (20)

Each case study is scored out of 10:

| Element | Points |
|---|---|
| Summary facts (client, event, city, year, role) | 2 |
| Scale numbers | 2 |
| Venue named | 1 |
| Specific responsibilities | 2 |
| Technical or production highlights | 2 |
| Measured outcome | 1 |

"Delivered on time" alone doesn't count as an outcome. A fact that is wrong on the page (since corrected) costs 1 point in BEFORE. Credits are shown exactly as each version has them.

| Case study | Credit BEFORE | Credit AFTER | BEFORE | AFTER | What still costs points (AFTER) |
|---|---|---|---|---|---|
| Google Cloud Summit London 2026 | Senior Production Manager | Senior Production Manager | 7 | 8 | No outcome; responsibilities are two generic bullets |
| Google Cloud Summit London 2025 | Production Manager | Senior Production Manager | 5 | 7 | No highlights, no outcome |
| Google Cloud Summit London 2024 | Technical | Senior Production Manager | 5 | 6 | Responsibilities describe AV scope only; no highlights, no outcome |
| Xerocon London 2026 | Technical Director | Technical Director | 4 | 8 | Responsibilities generic; no outcome |
| Xerocon Denver 2026 | Technical Director | Technical Director | 5 | 5 | No delegate count, crew size or highlights; "Directly supported the team" is vague |
| Xerocon Nashville | Technical Director | Technical Director | 4 | 5 | No highlights; scope is "support" only |
| Visa Everywhere Initiative | Executive Producer | Executive Producer | 3 | 4 | No venue, attendees or highlights |
| SoundCloud (new) | n/a | Lead Producer | n/a | 5 | No stand size or visitor numbers; "Ran the whole project" is generic |
| Yoto PlayDate London 2026 | Executive Producer | Executive Producer | 5 | 5 | Venue unnamed, no audience or replica dimensions |
| Netflix Stranger Things | Production Director | Production Director | 6 | 6 | Responsibilities are two generic bullets; no highlights section |
| Canva Studio Pop-Up | Executive Producer | Executive Producer | 4 | 7 | Responsibilities thin; no highlights section |
| Geely Auto EX5 | Executive Producer | Executive Producer | 6 | 7 | Only one highlight; no outcome |
| Microsoft x LCF (new) | n/a | Technical Director | n/a | 7 | Number of works, outcome |
| Google Pixel 3 Curiosity Rooms | Senior Producer | Senior Producer | 5 | 5 | No visitors, highlights or outcome |
| Aperol Spritz Australian Open | Executive Producer | Executive Producer | 4 | 8 | "Oversaw delivery" is the only responsibility; no outcome |
| Stella McCartney COP28 | Executive Producer | Executive Producer | 4 | 6 | Venue or zone unnamed; no footprint or visitors |
| MTV EMA After Party | Senior Producer | Senior Producer | 5 | 7 | Responsibilities generic; no outcome |
| Emirates Aviation Experience | Project Lead | Project Lead | 8 | 8 | No outcome (visitor numbers) |
| Battlefront II (Electronic Arts) | Senior Producer | Senior Producer | 4 | 5 | 300,000+ is the show's total, not your stand; no stand size or highlights |
| J&J Mobile Laboratory | Executive Producer | Executive Producer | 4 | 6 | No stops, audience or venue |
| Expo 2020 UAE National Day | Project Lead | Project Lead | 7 | 7 | Outcome is "Delivered on schedule" only |
| Samsung Galaxy A5 Tour | Senior Producer | Senior Producer | 5 | 5 | Cities unnamed; no highlights |
| Parrtjima | Creative Technologist | Creative Technologist | 3 | 4 | No number of works, site or highlights |
| Destination NSW The Long Road | Producer | Producer | 5 | 5 | No views or reach; outcome is "on schedule" |
| Rizlab | Producer | Producer | 4 | 6 | Responsibility is one line |
| Gunpowder Plot | Executive Producer | Executive Producer | 4 | 5 | No scale section, capacity or highlights |
| Mastercard UEFA Champions League Final | Senior Producer | Senior Producer | 3 | 3 | **Thinnest page:** no numbers, venue or highlights |
| Mastercard British Open Golf | Senior Producer | Senior Producer | 4 | 4 | No scale section, footprint or highlights |
| Emirates Global Sports Programme | Senior Producer | Senior Producer | 5 | 6 | Year shown as 2015 for a multi-year programme |
| Emirates Cricket World Cup | Senior Producer | Senior Producer | 3 | 3 | **Thinnest page:** "Multiple host cities", no numbers |
| NTT Data Open Data Wall | Senior Producer | Senior Producer | 3 | 5 | No screen spec or scale section |
| Aqua Rugby | Executive Producer | Executive Producer | 6 | 7 | No attendance |
| **Average** | | | **4.7 (30)** | **5.8 (32)** | |

Notes on the table:
- **Credit changes between the versions** are GCS 2024 ("Technical" to "Senior Production Manager") and GCS 2025 ("Production Manager" to "Senior Production Manager"). `site-audit.md` records these as your instruction. All other `role` values in `data/projects.json` are unchanged.
- **Other data changes** are the EA client (now Electronic Arts), the Gunpowder Plot agency and year, and the NTT Data year and location.
- **Outcomes:** only 2 of 32 AFTER case studies have a measured outcome (Canva, Rizlab). Expo 2020 and Destination NSW have an "Outcome" heading that only says "on schedule".
- **Thin pages:** 10 AFTER case studies score 5 or below on 5 or more criteria that need your facts. They are listed in Questions.

**Core pages**

| Page | BEFORE | AFTER |
|---|---|---|
| About | 409 words; H1 "Why hire me"; no career history; contains the GCS contradiction | 1,034 words; H1 "About Kimber Sykes"; canonical opener; three service sections with 20 case study links; sectors, where, career summary (2003 to present) and credentials |
| Home | 292 words; vague intro | 316 words; one-liner intro; About block links to /about and to the services |
| Work | 50 words (skeleton) | 836 words, all 32 cards |
| Clients | 52 words, logos only | 65 words, **still logos only**, so you can't tell from the page what you did for Sony, Diageo, AmEx, Disney and the others |
| Where | 232 words | 248 words; not linked to case studies |
| Contact | 77 words | 91 words; fine for its purpose |

**Scores**
- BEFORE **8 / 20**: case studies 6.5 of 14, core pages 2 of 6.
- AFTER **13 / 20**: case studies 8.1 of 14, core pages 5 of 6. The point lost on core pages is `/clients`.

### 3.6 AEO readiness (15)

**BEFORE: 4 / 15**
- No answer-first copy. Case study openers describe the event, not you: "Aperol Spritz was the official aperitif sponsor of the Australian Open 2024."
- No question-shaped headings anywhere. Every case study has only an H1 and "Gallery".
- **llms.txt** (9,214 bytes) has em dashes in the H1 and every link label, and points to a "Contact form" that doesn't exist. Its case study lines don't state your credit, and they repeat the stale facts (4,000 attendees, Holborn, Wembley Theatre, "TV series"). There is no llms-full.txt.

**AFTER: 12 / 15**
- **Answer-first case studies:** every case study opens with one summary sentence that states the credit, agency, project, place and year, e.g. "Senior Producer for Pulse Group on the NTT Data Wall at The Open Championship, Royal Liverpool, Hoylake, in 2014." The same sentence is the meta description and the schema `description`, so it is quotable.
- **Question-shaped headings:**
  - About: "How can Kimber help your agency?", "Which sectors does he work in?", "Where does he work?"
  - Case studies: "What was the brief?" and "What was Kimber responsible for?"
- **llms.txt** (17,000 bytes) has:
  - the canonical one-liner, a Profile block, three Services with case study links, the career summary and the key pages;
  - all 32 case studies grouped by sector as `Client, Location, Year. Kimber's credit: <Role> for <Agency>.`;
  - no dashes.
- **llms-full.txt** (40,389 bytes) has the full structured text of every case study plus the delivery locations.
- Both files are byte-identical live and linked from every page.
- **Costs (-3):**
  - The case study H2s are the same five generic questions on all 32 pages, so they add structure but not distinct queries. The client name is also missing from the H1 (see 3.2).
  - In llms-full.txt, the in-section labels ("What was the brief?", "Scale and constraints") are plain text lines, not Markdown headings, so chunkers treat them as body text.
  - Questions like "has Kimber worked with Sony / Diageo / American Express?" can only be answered from a bare name list. Nothing on the site says what you did or through which agency.
  - Visa Everywhere (a start-up competition final) and SoundCloud (a stand at a music industry weekend) are filed under "B2B tech conferences", which weakens that sector's signal.

### 3.7 Performance and accessibility (10)

**BEFORE: 4 / 10**
- **Images:**
  - Case study heroes are original JPEGs, preloaded at `100vw` (e.g. `<link rel="preload" as="image" href="/images/work/aqua-rugby/hero.jpg"/>`).
  - Gallery images are JPEG only. The `aqua-rugby` folder alone has files of 290 to 830 KB.
  - The homepage emits **47** `rel="preload" as="image"` tags for marquee logos.
- **JavaScript-dependent content:** `/work` is client-rendered.
- **Alt text:** every `<img>` has an `alt`, but gallery alts are generic ("event photograph 1 of 7").
- **Fine already:** the homepage hero already used a `<picture>` with WebP, and fonts are self-hosted with preloads.

**AFTER: 7 / 10**
- **Images:**
  - Responsive WebP at 640, 1280 and 1920 pixels for every work and about photo.
  - Case study heroes are preloaded with `imageSrcSet` (e.g. `/images/_opt/work/aqua-rugby/hero-640.webp 640w, ...`).
  - The homepage has **0** image preloads, and the marquee logos are `fetchPriority="low"`.
  - The `/work` grid is all WebP.
- **Live test**, Playwright Chromium, 1 October 2026. Mobile was 390 px wide at device pixel ratio 3, on a 1.6 Mbps link with 150 ms latency and 4x CPU slowdown:

  | Page | Mobile LCP | LCP element (mobile) | Desktop LCP |
  |---|---|---|---|
  | Home | 1.5 s | `ks_home-1200.webp` | 0.4 s |
  | About | 1.8 s | portrait 1280 WebP | 0.4 s |
  | `/work/aqua-rugby` | 3.4 s | hero 1280 WebP, 552 KB of images | 0.6 s |
  | `/work` | **4.1 s** | first card, `xerocon-london-2026/02-1280.webp` | 0.7 s |
  | `/where` | 0.6 s | text | 0.3 s |

- **Cost (-1): every card on `/work` is `loading="lazy"`,** including the first row (32 of 32 images). The LCP image is therefore lazy-loaded, which is why `/work` is the slowest page on mobile.
- **Cost (-1):** gallery alt text is still generic ("Geely Auto EX5 Brand Launch, event photograph 1 of 8"). You chose to skip this for now, so it's listed, not pushed.
- **Cost (-1):**
  - `/where` "Right Now" content and the map are client-side only.
  - `portrait.jpg` is missing from git, so a clean build has a broken portrait (see 3.2).
  - The homepage HTML is 116 KB because the logo marquee is duplicated.
- **Fine:**
  - `lang="en-GB"`.
  - One H1 per page and no heading jumps on the pages checked.
  - The portrait alt is descriptive.
  - The homepage hero `alt=""` is acceptable if the image is decorative.

---

## 4. Claims in site-audit.md that I checked

| Claim | Result |
|---|---|
| `/work` ships all case study links in static HTML | **Confirmed** (32 links, three sector H2s) |
| One `@graph` per page, all `@id`s resolve | **Confirmed** (0 unresolved site-wide) |
| Titles, descriptions of 160 characters or fewer, OG fields, `en-GB`, custom 404, RSC `noindex` | **Confirmed** (live headers checked) |
| No em or en dashes anywhere | **Confirmed** (0 files in `out/`) |
| Retired facts removed | **Confirmed** |
| Redirects for `/rizler`, `/aqua-rugby-australia`, `/bbraun` | **Confirmed live** (301) |
| Homepage logo preloads 47 to 0 | **Confirmed** |
| "Honest lastmod from git" | **True but not yet useful:** all 38 URLs share one timestamp, because one commit changed everything |
| "Every image and srcset variant exists" | **Only in your working folder.** `portrait.jpg` is gitignored, so a clean checkout lacks it |
| llms.txt 13 KB, llms-full.txt 23 KB | **Out of date:** now 17,000 and 40,389 bytes (later batches added services and career) |
| Aqua Rugby loads 103 KB of images on a phone | **Not reproduced:** on a DPR 3 phone the browser picks the 1280 px hero and loaded 552 KB of images in my run. Your figure may assume DPR 1 or 2 |
| Career summary from "the CV and Kimber's answers" | **Conflicts with the answers recorded in the same file** (see 3.4) |

---

## 5. Top 10 remaining improvements (AFTER), ranked

Ranked by impact for effort. **H**, **M** and **L** mean high, medium and low. Effort **S** is under an hour, **M** is half a day, and **L** needs facts from you. No item adds pricing, rates, booking length, lead times or an FAQ, and no item changes a credit.

| # | Change | Impact | Effort |
|---|---|---|---|
| 1 | Put the client name in case study titles, H1s and `CreativeWork.name` | H | S |
| 2 | Track `portrait.jpg` in git | H | S |
| 3 | Resolve the identity mismatches (career dates, client count, Wonder, GCS 2024 scope) | H | S (needs answers) |
| 4 | Eager-load the first row on `/work` | M | S |
| 5 | Add a text list under the `/clients` logos | H | M |
| 6 | Model each case study's event and venue in JSON-LD | M | M |
| 7 | Fill the scale and outcome gaps on the ten weakest case studies | H | L |
| 8 | Link `/where` cities to case studies and render "Right Now" statically | M | S |
| 9 | Re-file Visa Everywhere and SoundCloud into the right sector | M | S |
| 10 | Small schema and llms-full.txt tidy-ups | L | S |

1. **Put the client name in case study titles, H1s and `CreativeWork.name`.** Keep the credit exactly as written. The pattern is `{Client} {Project}, {Credit} | Kimber Sykes`, e.g. `Aperol Spritz at the Australian Open 2024, Executive Producer | Kimber Sykes` and H1 "Aperol Spritz at the Australian Open". This applies where the project label omits the client: aperol-spritz, aqua-rugby, johnson-johnson, gunpowder-plot, soundcloud, geely-auto, emirates-cricket, emirates-sports, mastercard-british-open, mastercard-ucl, expo-2020, ea-sports-battlefront, mtv-ema, stella-mccartney-cop28 and samsung-galaxy-a5. Use the `project` field in `data/projects.json` and the title builder in `app/work/[slug]/page.tsx`.

2. **Track `portrait.jpg` in git.** In `.gitignore`, change line 14 from `portrait.jpg` to `/portrait.jpg` so it only ignores a root scratch file, then commit `public/images/about/portrait.jpg`. This removes the risk of a clean or CI build publishing a broken `og:image` and schema image.

3. **Resolve the identity mismatches.** Change nothing until you answer Questions 1 to 4:
   - set the career dates in `data/site.json` (`career`) to whatever you confirm;
   - make the homepage client count and the `/clients` page come from one list (add Arise Fashion to `data/clients.json` with no logo, or drop it from `CLIENTS_WITHOUT_LOGO`);
   - choose "Wonder" or "We Are Wonder" once in `data/agencies.json`;
   - reword the GCS 2024 responsibilities to match the credit, using your facts.

4. **Eager-load the first row on `/work`.** In the work card component, set `priority` (or `loading="eager"` and `fetchPriority="high"`) on the first 2 cards on mobile and the first 4 on desktop, and keep the rest lazy. Also cap the hero and card `sizes` so a DPR 3 phone doesn't pull the 1280 px variant for a 390 px slot where 640 px would do. For example, use `sizes="(max-width: 640px) 100vw, 50vw"` for cards and serve the 1280 hero only above 640 px. Target: mobile LCP on `/work` and on case studies under 2.5 s in the test above.

5. **Add a server-rendered text list under the `/clients` logos.** Each entry gives the brand name, its sector, and a link to its case study where one exists (e.g. "Netflix: Stranger Things Fan Experience, Paris, 2022"). For brands with no case study, show only the name and sector unless you give the facts (Question 6). This was batch 7 in `site-audit.md`, and it is the single biggest content gap AI engines hit when asked "has he worked with X".

6. **Model each case study's event and venue in JSON-LD.** In `scripts/lib/schema-graph.mjs`, add `about: {"@type":"Event", "name", "startDate" (only where the page states dates), "location": {"@type":"Place","name": venue, "address": {addressLocality, addressCountry}}, "organizer": client}` to each `CreativeWork`, and set `locationCreated` to the same venue Place. Use only venues already on the pages (Tobacco Dock, Olympia Grand Hall, Colorado Convention Center, Music City Center, Cirque d'Hiver, Luna Park Big Top, Old Spitalfields Market, ExCeL London, Fountain Studios, 55 Regent Street, Hello Love, Royal Liverpool, Royal Troon, Al Wasl Plaza, Tower Vaults, Classic Car Club, Melbourne Airport T2). This needs a `venue` field per project in `data/projects.json`. Nest the event under `about`, not as a top-level `Event`, so it isn't read as a ticketed event listing.

7. **Fill the scale and outcome gaps on the ten weakest case studies,** using facts only you can supply (Questions 7 and 8): Mastercard UCL (3), Emirates Cricket World Cup (3), Visa (4), Parrtjima (4), Mastercard Open (4), then Xerocon Denver, Yoto, Samsung, Pixel 3 and Battlefront II (5). Even one figure per page (footprint, visitors, crew size, cities) moves each page 1 to 2 points.

8. **Link `/where` cities to their case studies (server-rendered) and give "Where is Kimber Right Now?" a static first line.** For example, "Based in London; live location updates below." That way the H2 isn't empty without JavaScript. The data is already in `data/map.json`.

9. **Re-file Visa Everywhere and SoundCloud** into the sector that fits once you confirm (Question 9). The `sector` field in `data/projects.json` drives `/work`, llms.txt and the schema `genre`.

10. **Small schema and llms-full.txt tidy-ups:**
    - use the bare address for `Person.email`, as on the business node;
    - change the home `WebPage @id` to `https://kimbersykes.com/#webpage`;
    - emit the llms-full.txt section labels as `####` headings in `scripts/generate-llms-txt.mjs`;
    - add a "Last updated: {date}" line to the top of both llms files (no visible date on case studies, as you asked);
    - consider shortening the home title to under 65 characters, e.g. `Kimber Sykes | Freelance Executive Producer, London`.

---

## 6. Questions for Kimber

Anything left unanswered stays off the site.

**Identity and credits**
1. **Resolved 1 Oct 2026: Senior Production Manager for all three years.** Original question: **Google Cloud Summit credits.** At `444d42b` the site credited 2024 as "Technical" and 2025 as "Production Manager". Master credits all three years as "Senior Production Manager", which `site-audit.md` records as your instruction on 1 October.
   - Is that final?
   - If it is, what did your 2024 role cover beyond "all audio-visual elements across the experiential areas", so the 2024 page matches the credit?
2. **Resolved 1 Oct 2026: the published dates are correct** (see Follow-up). Original question: **Career dates.**
   - The site says Pulse Group 2012 to 2015 and freelance from 2015. Your recorded answer says 2012 to 2016, and freelance from 2016. Which is right?
   - Is t7 event solutions 2008 to 2011 (site) or 2003 to 2008 (your earlier answer)?
3. **Award nomination.** Please confirm the wording "Nominated for Meeting and Event Association Australian Young Professional of the Year 2010" is accurate and fine to publish.
4. **Agency naming.** Should it be "Wonder" or "We Are Wonder" on the site?
5. **Role wording** (the Google Cloud Summit credit is settled; this is only about the identity line). Should the identity line keep "Production Manager", or say "Senior Production Manager" to match your current credits?

**Clients page**
6. **Arise Fashion** (Lagos and Dubai on the map) counts towards "48 clients" but isn't on `/clients`. Should it be listed? If so, what was the year, agency and your credit? And for any brands on `/clients` with no case study (Sony, Diageo, American Express, Disney, Instagram, CNN, Marriott, Pfizer, Philips, Peugeot, Infiniti, Jaguar, Commonwealth Bank and others), a one-line "what and which agency" for those you're happy to state.

**Case study facts**
7. Facts for the weakest pages, as numbers where possible:
   - **Mastercard UCL Final:** footprint, visitors, number of touchpoints.
   - **Emirates Cricket World Cup:** host cities, number of match days.
   - **Visa Everywhere:** venue, attendees.
   - **Parrtjima:** number of works you built.
   - **Mastercard at The Open:** footprint, visitors.
   - **Xerocon Denver:** delegates, crew size.
   - **Yoto:** venue name, audience size, replica dimensions.
   - **Samsung A5:** the five cities.
   - **Pixel 3:** visitors, team size.
   - **Battlefront II:** stand size.
   - **J&J:** number of tour stops.
   - **SoundCloud:** stand size.
   - **Stella McCartney:** footprint.
   - **GCS 2024 and 2026:** number of rooms or stages, your team size.
8. **Outcomes.** For any project, is there a measurable result you can state (attendance against target, footfall, press or social reach, zero incidents, client rebooking)? Only Canva and Rizlab have one today.

**Classification and wording**
9. **Sector.** Should Visa Everywhere (start-up competition final) and SoundCloud (stand at a music industry weekend) stay under "B2B tech conferences", or move to "Consumer brand activations"?
10. **Emirates sports programme.** The page shows the year as 2015. Which years did you work on it?
11. **Gunpowder Plot.** The client is shown as "Gunpowder Plot". Should it name the client organisation instead?
12. **Yoto.** The page says you were unavailable for the live dates and handed delivery to a team you contracted. Are you happy with that wording on a public page?
13. **Gallery alt text.** Do you still want to defer real gallery alt text (written by looking at each photo, describing only what is visible)?
