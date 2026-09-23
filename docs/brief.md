# Kimber Sykes — product brief

**Status:** Site deployed at [kimbersykes.com](https://kimbersykes.com). For operations and content updates, see [docs/README.md](README.md).

Reference document from the original build (May 2026). Some handover items below are complete.

---

## 1. Project Overview

Build a bespoke portfolio website for Kimber Sykes, a freelance Executive Producer and Production Manager with three distinct areas of specialism:

1. **B2B Technology Conferences**: Google Cloud Summit, Xerocon
2. **Consumer Brand Activations**: Netflix, Canva, Aperol, Geely Auto, Google Pixel
3. **Sports Sponsorship and Major Tournament Activations**: Emirates (Tennis, Golf, Cricket, Commonwealth Games), Mastercard (Champions League, British Open Golf), Visa (Women's World Cup), NTT Data (British Open Golf)

The site must serve two audiences simultaneously:

1. **AI agents**: being asked to source freelance production talent (e.g. "find me a freelance production director with B2B tech conference experience in London"). The site must be machine-readable, semantically structured, and rich with text-based metadata.
2. **Senior industry professionals**: Heads of Production, Account Managers, Managing Directors, and peers vetting Kimber's credentials. The site must communicate scale, credibility, and range within seconds.

The site is not a showreel platform. It is a professional positioning tool that must work as hard as a CV while looking significantly better than one.

---

## 2. Tech Stack

- **Framework**: Next.js (App Router)
- **Hosting/Edge**: Cloudflare Pages + Cloudflare Workers
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Map**: React Simple Maps or Leaflet (free, open source)
- **Data**: Local JSON files for all structured content (projects, clients, agencies, map data). Developer to advise on migrating to a headless CMS later if needed.
- **Fonts**: Developer to select. Must be distinctive, not Inter or Roboto. Suggest a bold display font paired with a refined body font (e.g. Syne + DM Sans, or Neue Haas Grotesk + Libre Baskerville).
- **Theme**: Dark. Deep near-black background (#0D0D0D or similar), white/off-white text, single strong accent colour (suggest warm amber or electric blue). Developer to propose options.
- **Analytics**: Cloudflare Web Analytics (cookieless beacon, `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN`). AI crawler visits logged to D1 via `workers/crawler-logger`. See [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 3. Site Architecture

### Pages

```
/                   → Home
/work               → Full project gallery
/work/[slug]        → Individual project page
/clients            → Client & agency logo gallery
/where              → Interactive world map
/about              → Bio + CV summary
/contact            → Contact page
```

### Navigation
- Fixed top navigation bar, minimal
- Logo/wordmark left: "Kimber Sykes"
- Links right: What / Who / Where / Why / How
- Mobile: hamburger menu

---

## 4. Page Specifications

---

### 4.1 Home (`/`)

**Purpose**: Immediate credibility signal. Fast, bold, confident.

**Sections**:

1. **Hero**
   - Full-width, dark background
   - Large typographic statement. Not a tagline, a declaration:
     > "Executive Producer. Production Manager. Technical Director."
   - Subline (current site): large-scale conferences, flagship brand experiences, and touring sports programmes, from first technical drawing to load-out, anywhere in the world.
   - Single CTA: "See the Work" → `/work`
   - No hero image. Typography and negative space carry this.

2. **By the Numbers** (thin horizontal band)
   - 4 stats displayed as large numerals:
     - 20+ Years Experience
     - 30+ Global Brands
     - 20+ Countries
     - Roles from Technical to Executive Producer
   - These must exist as real text in the HTML, not image-rendered

3. **Client Logo Strip (Brands)**
   - Horizontal scrolling marquee of client logos (SVG/PNG)
   - No agency logos here. Clients only.
   - Order on the home page is controlled in code (`MARQUEE_IDS`); featured-case-study clients should appear first where possible
   - Logos: Google, Google Cloud, Netflix, Canva, Geely, Mastercard, Visa, Emirates, Samsung, Johnson & Johnson, Stella McCartney, Aperol, MTV, Microsoft, Xero, NTT Data, EA Sports, Sony, Diageo, Philips, SoundCloud, Peugeot, Infiniti, Jaguar, American Express, Commonwealth Bank, Walt Disney, Instagram (plus additional marks on `/clients` only: Lilly, Destination NSW, CNN, Marriott, Tourism NT)
   - Must also render as alt text for accessibility and AI readability

4. **Agency Logo Strip**
   - Second horizontal marquee beneath Brands, same motion pattern, agency marks only
   - Order follows `data/agencies.json` (Wonder, Jack Morton, Amplify, INVNT, Imagination, Octagon, Pulse Group, BMF, Curiious, AGB Events, Yakusan, Emotive, We Are Listen, Exposure, K&K Productions, Bacchus, Blondefish)

5. **Featured Work** (3–4 cards)
   - Hand-curated via `data/featured.json`, not auto-generated
   - Current set: Netflix Stranger Things, Google Cloud Summit 2025, Canva Studio, Geely Auto
   - Each card: full-bleed project image, client name, role, year
   - "View All Work" link → `/work`

6. **One-line positioning statement**
   - "Available for freelance contracts worldwide. Based in London."

---

### 4.2 Work Gallery (`/work`)

**Purpose**: Curated visual gallery of projects, editorially ordered.

**Layout**: Responsive CSS grid, 3 columns desktop, 2 tablet, 1 mobile. No filtering, no sorting controls. Order is curated, not chronological.

**Card design**:
- Full-bleed project image (aspect ratio 16:9 or 3:2, consistent)
- On hover: overlay with client name, role title, agency, year
- Click → individual project page

**Curation order (top to bottom)**:

Priority tier (lead with these):
1. Google Cloud Summit 2025, Wonder, London
2. Google Cloud Summit 2024, Wonder, London
3. Netflix Stranger Things, Amplify, Paris
4. Canva Studio Pop-Up, Jack Morton, London
5. Geely Auto EX5 Launch, INVNT, Sydney
6. Xerocon Nashville, INVNT, Sydney
7. Visa Everywhere Initiative, BMF, London
8. Google Pixel 3, Amplify, London
9. Aperol Spritz / Australian Open, Yakusan, Sydney
10. Stella McCartney / COP28, INVNT, Dubai
11. Mastercard UEFA Champions League, Octagon, Milan
12. Mastercard British Open, Octagon, London
13. MTV EMA Awards, Amplify, London
14. Emirates Aviation Experience, Pulse Group, London
15. Emirates Sports Sponsorship, Pulse Group, London
15a. Emirates Cricket World Cup, Pulse Group, Australia and New Zealand
16. NTT Data British Open, Pulse Group, London
17. EA Sports Battlefront II, Amplify, London
18. SoundCloud, Amplify, London
19. Johnson and Johnson Mobile Laboratory, K&K, Sydney
20. Expo 2020 National Day, Curiious, Dubai
21. Samsung Galaxy A5, Imagination, Sydney
22. Parrtjima Festival, AGB Events, Alice Springs
23. Microsoft x London College of Fashion, We Are Listen, New York (when case study exists on site)
23a. Destination NSW, The Long Road, Emotive, New South Wales
24. Rizla, Exposure, London
25. Aqua Rugby Australia, Sydney (deprioritised, appears near end)
26. Gunpowder Plot, Independent, London (deprioritised, appears near end)

**Image folder structure**:
```
/public/images/work/
  google-cloud-summit-2025/
    hero.jpg
    01.jpg
    02.jpg
    03.jpg
    ...
  google-cloud-summit-2024/
    hero.jpg
    01.jpg
    ...
  netflix-stranger-things/
  canva-studio/
  geely-auto/
  xerocon-nashville/
  visa-everywhere/
  google-pixel-3/
  aperol-spritz/
  stella-mccartney-cop28/
  mastercard-ucl/
  mastercard-british-open/
  mtv-ema/
  emirates-aviation/
  emirates-sports/
  emirates-cricket/
  ntt-data/
  ea-sports-battlefront/
  soundcloud/
  johnson-johnson/
  expo-2020/
  samsung-galaxy-a5/
  parrtjima/
  destination-NSW/
  microsoft-lcf/
  rizla/
  aqua-rugby/
  gunpowder-plot/
```

---

### 4.3 Individual Project Page (`/work/[slug]`)

**Purpose**: Full project detail. This is where both humans and AI agents get the substance.

**Layout**:
- Full-width hero image
- Project metadata block (rendered as real HTML text, critical for AI readability):
  - Role
  - Agency
  - Client
  - Year
  - Location
- Body copy: 2–3 paragraphs describing the project, Kimber's specific contribution, and scale/complexity. See Section 7 for copy.
- Photo gallery: masonry or grid of additional project images
- Bottom navigation: ← Previous Project / Next Project →

**SEO requirements per project page**:
- `<title>`: [Client] [Project], [Role] | Kimber Sykes
- `<meta description>`: First sentence of project body copy
- All images must have descriptive `alt` text
- Schema.org structured data: `Event` or `CreativeWork` type

---

### 4.4 Clients Page (`/clients`)

**Purpose**: Visual proof of brand-level credibility. Fast to scan, impressive at a glance.

**Layout**: Two sections

**Section 1: Clients (Brands)**
- Large logo grid, generous spacing, logos presented at equal visual weight
- All logos in a unified treatment: white/light version on dark background
- Logos must have alt text with the brand name
- Include all brands listed in 4.1 logo strip plus: Lilly, Peugeot, Scottish Water, Destination NSW, Arise Fashion, CNN, Marriott Group

**Section 2: Agencies**
- Smaller, secondary grid below a dividing line
- Label: "Delivered through"
- Agencies: Wonder, Jack Morton, Amplify, INVNT, Imagination, Octagon, Pulse Group, BMF, Curiious, AGB Events, Yakusan, Emotive, We Are Listen, Exposure, K&K Productions, Bacchus, Blondefish

**Image folder structure**:
```
/public/images/logos/
  clients/
    google.svg
    netflix.svg
    canva.svg
    mastercard.svg
    visa.svg
    emirates.svg
    samsung.svg
    johnson-johnson.svg
    stella-mccartney.svg
    aperol.svg
    mtv.svg
    microsoft.svg
    xero.svg
    ntt-data.svg
    ea-sports.svg
    sony.svg
    diageo.svg
    philips.svg
    soundcloud.svg
    geely.svg
    peugeot.svg
    infiniti.svg
    jaguar.svg
    american-express.svg
    commonwealth-bank.svg
    walt-disney.svg
    instagram.svg
    lilly.svg
    scottish-water.svg
    destination-nsw.svg
    cnn.svg
    marriott.svg
  agencies/
    wonder.svg
    amplify.svg
    jack-morton.svg
    invnt.svg
    imagination.svg
    octagon.svg
    pulse-group.svg
    bmf.svg
    curiious.svg
    agb-events.svg
    ellipsis.svg
    yakusan.svg
    emotive.svg
    we-are-listen.svg
    exposure.svg
    kk-productions.svg
```

---

### 4.5 Where (`/where`)

**Purpose**: Visual proof of global delivery capability. Interactive, data-rich, impressive.

**Map implementation**:
- Full-width dark world map (suggest React Simple Maps with a dark-styled TopoJSON)
- Countries where Kimber has worked are highlighted in the accent colour
- All other countries in a muted dark tone
- On hover: country highlights/brightens
- On click: side panel or modal slides in showing:
  - Country name
  - List of projects delivered there, each showing: Client logo + Client name + Agency + Year

**Data structure** (JSON file; developer builds UI against this, Kimber populates):

```json
[
  {
    "country": "United Kingdom",
    "countryCode": "GB",
    "projects": [
      { "client": "Google", "agency": "Wonder", "project": "Google Cloud Summit 2025", "year": 2025 },
      { "client": "Google", "agency": "Wonder", "project": "Google Cloud Summit 2024", "year": 2024 },
      { "client": "Netflix", "agency": "Amplify", "project": "Stranger Things Fan Experience", "year": 2022 },
      { "client": "Canva", "agency": "Jack Morton", "project": "Canva Studio Pop-Up", "year": 2023 },
      { "client": "Mastercard", "agency": "Octagon", "project": "British Open Golf", "year": 2016 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Emirates Aviation Experience", "year": 2014 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: ATP Tennis (London)", "year": 2015 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: PGA Golf (UK)", "year": 2015 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship Program", "year": 2015 },
      { "client": "NTT Data", "agency": "Pulse Group", "project": "British Open Golf", "year": 2013 },
      { "client": "Visa", "agency": "BMF", "project": "Visa Everywhere Initiative", "year": 2019 },
      { "client": "MTV", "agency": "Amplify", "project": "EMA Awards After Party", "year": 2017 },
      { "client": "Google", "agency": "Amplify", "project": "Google Pixel 3 Launch", "year": 2018 },
      { "client": "EA Sports", "agency": "Amplify", "project": "Battlefront II Launch", "year": 2017 },
      { "client": "SoundCloud", "agency": "Amplify", "project": "Activation", "year": 2017 },
      { "client": "Gunpowder Plot", "agency": "Independent", "project": "Immersive Experience", "year": 2020 },
      { "client": "Rizla", "agency": "Exposure", "project": "Rizlab", "year": 2011 }
    ]
  },
  {
    "country": "Scotland",
    "countryCode": "GB-SCT",
    "projects": [
      { "client": "Mastercard", "agency": "Octagon", "project": "British Open Golf, Troon", "year": 2016 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Commonwealth Games, Glasgow", "year": 2014 }
    ]
  },
  {
    "country": "France",
    "countryCode": "FR",
    "projects": [
      { "client": "Netflix", "agency": "Amplify", "project": "Stranger Things Fan Experience", "year": 2022 },
      { "client": "Peugeot", "agency": "Curiious", "project": "Concept Car Launch", "year": 2022 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: ATP Tennis (Roland Garros, Paris)", "year": 2015 },
      { "client": "Visa", "agency": "BMF", "project": "FIFA Women's World Cup", "year": 2019 }
    ]
  },
  {
    "country": "Spain",
    "countryCode": "ES",
    "projects": [
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: ATP Tennis (Barcelona)", "year": 2015 }
    ]
  },
  {
    "country": "Italy",
    "countryCode": "IT",
    "projects": [
      { "client": "Mastercard", "agency": "Octagon", "project": "UEFA Champions League Final, Milan", "year": 2016 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: ATP Tennis (Rome)", "year": 2015 }
    ]
  },
  {
    "country": "United States",
    "countryCode": "US",
    "projects": [
      { "client": "Xero", "agency": "INVNT", "project": "Xerocon Nashville", "year": 2024 },
      { "client": "Peugeot", "agency": "Curiious", "project": "Concept Car Launch Las Vegas", "year": 2022 },
      { "client": "Microsoft", "agency": "We Are Listen", "project": "x London College of Fashion, New York", "year": 2019 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: ATP Tennis (Indian Wells and New York)", "year": 2015 }
    ]
  },
  {
    "country": "Australia",
    "countryCode": "AU",
    "projects": [
      { "client": "Geely Auto", "agency": "INVNT", "project": "EX5 Brand Launch", "year": 2025 },
      { "client": "Aperol Spritz", "agency": "Yakusan", "project": "Australian Open", "year": 2024 },
      { "client": "Johnson & Johnson", "agency": "K&K Productions", "project": "Mobile Laboratory", "year": 2021 },
      { "client": "Samsung", "agency": "Imagination", "project": "Galaxy A5 Launch", "year": 2017 },
      { "client": "Tourism NT", "agency": "AGB Events", "project": "Parrtjima Festival", "year": 2021 },
      { "client": "Aqua Rugby Australia", "agency": "Independent", "project": "Darling Harbour Festival", "year": 2024 },
      { "client": "Destination NSW", "agency": "Emotive", "project": "The Long Road", "year": 2020 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Cricket World Cup", "year": 2015 }
    ]
  },
  {
    "country": "New Zealand",
    "countryCode": "NZ",
    "projects": [
      { "client": "Emirates", "agency": "Pulse Group", "project": "Cricket World Cup", "year": 2015 }
    ]
  },
  {
    "country": "United Arab Emirates",
    "countryCode": "AE",
    "projects": [
      { "client": "Stella McCartney", "agency": "INVNT", "project": "Sustainable Market at COP28", "year": 2023 },
      { "client": "Expo 2020", "agency": "Curiious", "project": "UAE National Day Celebration", "year": 2021 },
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: PGA Golf (Dubai)", "year": 2015 }
    ]
  },
  {
    "country": "Malaysia",
    "countryCode": "MY",
    "projects": [
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: PGA Golf (Kuala Lumpur)", "year": 2015 }
    ]
  },
  {
    "country": "China",
    "countryCode": "CN",
    "projects": [
      { "client": "Emirates", "agency": "Pulse Group", "project": "Sports Sponsorship: PGA Golf (Shanghai)", "year": 2015 }
    ]
  }
]
```

> **Note to Kimber**: This is a starter dataset. Many countries are still missing, so please populate `/data/map.json` fully before or after launch. The structure is: country, countryCode (ISO 3166-1 alpha-2), and an array of projects each with client, agency, project name, and year. Scotland uses GB-SCT as its code; the developer should confirm the map library handles subdivisions, or treat this as UK.

---

### 4.6 About (`/about`)

**Purpose**: Human-readable bio + machine-readable professional summary. This page must be especially text-rich for AI discoverability.

**Layout**:
- Portrait photograph (left or top)
- Bio copy (see below)
- Key credentials listed as structured HTML (not an image)
- Downloadable CV link (PDF)
- Contact CTA

**Bio copy** (drawn from CV and portfolio; Kimber to review and refine):

> Kimber Sykes is a freelance Executive Producer, Production Manager, and Technical Director with over 20 years of experience delivering large-scale live events across three distinct disciplines: B2B technology conferences, consumer brand activations, and major sports sponsorship programmes.
>
> In the B2B tech space, Kimber has served as Production Manager for Google Cloud Summit, managing nine simultaneous conference rooms across a 4,000-attendee event, and as Technical Director for Xerocon Nashville. In consumer brand activations, credits include Production Director for the Netflix Stranger Things immersive fan experience in Paris, Executive Producer for the Canva Studio pop-up in London, and Senior Producer for the Google Pixel 3 Curiosity Rooms on Regent Street. In sports, Kimber has delivered global sponsorship programmes for Emirates across the ATP Tennis Tour (London, Paris, Barcelona, New York, Indian Wells, Rome), PGA Golf (Dubai, Kuala Lumpur, Shanghai), the Cricket World Cup (Australia, New Zealand), and the Commonwealth Games (Glasgow), as well as activations for Mastercard at the UEFA Champions League Final and the British Open Golf, and for Visa at the FIFA Women's World Cup.
>
> Based in London and available for contracts globally, Kimber has worked with some of the world's most recognised brands, including Google, Netflix, Canva, Mastercard, Visa, Emirates, Samsung, and Stella McCartney, through leading experiential agencies including Wonder, Amplify, Jack Morton, INVNT, Octagon, and Pulse Group. With a track record spanning the UK, Europe, Australia, the USA, the Middle East, and Asia, Kimber brings the operational rigour of large-scale conference production together with the creative problem-solving of high-profile consumer experience work and the logistical complexity of touring global sports programmes.

**Structured credentials block** (render as HTML list, critical for AI agents):

```
Roles: Executive Producer, Production Manager, Technical Director, Project Lead, Production Director
Specialisms: B2B Technology Conferences, Consumer Brand Activations, Sports Sponsorship Activations, Major Tournament Delivery, Experiential Events, AV Technical Delivery, Exhibition Floor Management, Show Flow, Live Event Production, Touring Global Programmes
Clients include: Google, Netflix, Canva, Mastercard, Visa, Emirates, Samsung, Stella McCartney, Johnson & Johnson, MTV, Microsoft, Xero, Aperol, EA Sports, NTT Data, Geely Auto
Agencies include: Wonder, Amplify, Jack Morton, INVNT, Octagon, Imagination, Pulse Group, BMF
Sports tournaments delivered: ATP Tennis Tour, PGA Golf Tour, Cricket World Cup, Commonwealth Games, UEFA Champions League, British Open Golf, FIFA Women's World Cup
Based: London, UK
Available: Worldwide
Experience: 20+ years
```

---

### 4.7 Contact (`/contact`)

**Purpose**: Simple, friction-free.

**Content**:
- One-line: "Available for freelance contracts. Get in touch."
- Email: kimber@kimbersykes.com (mailto link)
- Phone UK: +44 755 367 3133
- Phone US: +1 323 536 2611
- LinkedIn link (if Kimber provides URL)
- No contact form, direct contact only

---

## 5. SEO & AI Discoverability Requirements

These are non-negotiable and must be implemented from day one.

### 5.1 Page-level SEO
- Every page has a unique `<title>` and `<meta description>`
- Home title: "Kimber Sykes, Freelance Executive Producer and Production Manager | London"
- Home description: "Freelance Executive Producer, Production Manager and Technical Director specialising in B2B tech conferences, consumer brand activations, and major sports sponsorship programmes. 20+ years experience. Based in London, available worldwide."
- All project pages: "[Client] [Project], [Role] | Kimber Sykes"

### 5.2 Semantic HTML
- Correct heading hierarchy on every page (one `<h1>`, logical `<h2>`/`<h3>` structure)
- No text rendered inside images anywhere on the site
- All images have descriptive `alt` attributes
- Navigation uses `<nav>` landmark
- Main content uses `<main>` landmark

### 5.3 Structured Data (JSON-LD)
Implement on relevant pages:
- `Person` schema on About page (name, jobTitle, url, sameAs)
- `CreativeWork` or `Event` schema on each project page
- `WebSite` schema on home page with `SearchAction`

### 5.4 Sitemap & Robots
- Auto-generated `sitemap.xml` via Next.js
- `robots.txt` allowing all crawlers including AI agents (GPTBot, ClaudeBot, PerplexityBot must NOT be blocked)

### 5.5 Performance
- Target Lighthouse score 90+ on all pages
- Images: Next.js `<Image>` component with WebP, lazy loading, correct `sizes`
- No render-blocking scripts
- Cloudflare edge caching for static assets

---

## 6. Data Files

All content is managed via JSON files in `/data/`. Developer builds components to consume these. Kimber populates and updates the JSON directly or the developer adds a simple admin interface later.

```
/data/
  projects.json       ← All work gallery projects
  map.json            ← Country + project data for interactive map
  clients.json        ← Client logo list
  agencies.json       ← Agency logo list
  featured.json       ← 3–4 hand-picked home page featured projects
```

### projects.json structure:
```json
{
  "slug": "google-cloud-summit-2025",
  "client": "Google",
  "project": "Google Cloud Summit 2025",
  "agency": "Wonder",
  "role": "Production Manager",
  "year": 2025,
  "location": "London, UK",
  "sector": "B2B Tech",
  "heroImage": "/images/work/google-cloud-summit-2025/hero.jpg",
  "gallery": [
    "/images/work/google-cloud-summit-2025/01.jpg",
    "/images/work/google-cloud-summit-2025/02.jpg"
  ],
  "body": "For London Summit 2025, Kimber led production management and technical delivery across nine live conference rooms operating in parallel within a single, tightly programmed event. The role sat at the intersection of content, technical infrastructure, and on-the-ground delivery, ensuring every room ran safely, smoothly, and on schedule while supporting the wider production team across the site. Responsibilities included coordinating AV, staging, show flow, and crew across all nine spaces, managing multiple session formats including keynotes, panels, breakouts, and workshops."
}
```

---

## 7. Project Copy

Copy for each project page, drawn from portfolio and CV. Kimber to review and expand.

**Google Cloud Summit 2025**: Production Manager, Wonder, London, 2025
For London Summit 2025, Kimber led production management and technical delivery across nine live conference rooms operating in parallel. The role sat at the intersection of content, technical infrastructure, and on-the-ground delivery, ensuring every room ran safely, smoothly, and on schedule. Responsibilities included coordinating AV, staging, show flow, and crew across all nine spaces, managing keynotes, panels, breakouts, and workshops. Alongside room ownership, Kimber provided floating production support across the event by resolving technical faults, supporting speakers and moderators, and adapting rooms to last-minute changes.

**Google Cloud Summit 2024**: Technical, Wonder, London, 2024
The event at Tobacco Dock brought together 4,000 attendees over two days to explore the latest advancements in generative AI, security, cloud data, and collaboration technologies. Kimber led technical delivery in the experiential areas, managing all audio-visual elements and ensuring seamless execution across AI technology activations and 60+ exhibitor stands.

**Netflix, Stranger Things**: Production Director, Amplify, Paris, 2022
To launch Season 5 of Stranger Things, Netflix created an immersive fan experience in Paris at the historic Cirque d'Hiver, transporting guests into the world of Hawkins High School. The six-day event featured 12 interactive experience areas and a cast of 28 actors. Kimber managed the full production team and supplier network, delivering the event in seven weeks.

**Canva Studio Pop-Up**: Executive Producer, Jack Morton, London, 2023
Canva Studio was a pop-up experiential activation in Holborn, Central London, designed to immerse guests in the Canva product through interactive experiences. As Executive Producer, Kimber managed client and suppliers from concept to delivery in six weeks, navigating tight deadlines, material availability challenges, and a complex set build. Delivered on time and on budget.

**Geely Auto EX5 Launch**: Executive Producer, INVNT, Sydney, 2025
Geely Auto's launch into Australia, delivered across three key elements: a media drive day, internal staff training, and the official brand launch at Sydney's Luna Park for 400 guests. The event featured an ambitious 360° projection blend using 37 projectors. Kimber assembled and led the full freelance production team, managing client relationships, agency creatives, and finance teams throughout.

**Xerocon Nashville**: Technical Director, INVNT, Sydney, 2024
Xerocon is a B2B conference for accounting professionals, welcoming around 3,000 attendees from across the USA. Kimber oversaw the physical installation of the exhibition floor and provided technical and production support to the Sydney-based production team.

**Visa Everywhere Initiative**: Executive Producer, BMF, London, 2019
The Visa Everywhere Initiative is a global innovation program challenging startups to solve tomorrow's payment challenges. Kimber produced the European edition, managing venue, supplier, and client relationships across the event.

**Google Pixel 3**: Senior Producer, Amplify, London, 2018
Google Pixel's Curiosity Rooms transformed 55 Regent Street into an immersive three-floor experience blending fashion, food, and tech over five weeks. Developed in partnership with 72andSunny, OMD, Essence, and Halpern, and conceptualised and delivered in eight weeks.

**Aperol Spritz / Australian Open**: Executive Producer, Yakusan, Sydney, 2024
Aperol Spritz was the official aperitif sponsor of the Australian Open 2024. Kimber oversaw delivery of a standout concept store in Melbourne Airport's international departures terminal, including a bespoke tennis-themed interactive game and a large-format sunset installation.

**Stella McCartney / COP28**: Executive Producer, INVNT, Dubai, 2023
Stella McCartney launched a sustainable innovation exhibit during the COP28 UN Climate Conference. Kimber took on client handling, production management, and live event execution for a modular, sustainably built installation featuring 3D-printed stalls using photocatalysis technology.

**Mastercard UEFA Champions League**: Senior Producer, Octagon, Milan, 2016
On-site in Milan for the UEFA Champions League Final, Kimber delivered Mastercard's fan experience activation, including giveaways, priceless surprises, and branded fan journey touchpoints across the city.

**Mastercard British Open**: Senior Producer, Octagon, London, 2016
Fan activation delivered for Mastercard at the British Open Golf at Troon, Scotland.

**MTV EMA Awards**: Senior Producer, Amplify, London, 2017
An exclusive after-party for MTV at the iconic Wembley Theatre, welcoming VIP guests, talent, and A-list media to celebrate MTV's return to London after 12 years. Featured London cityscape projections, a voile cube installation, and a real London Tube carriage integrated into the space.

**Emirates Aviation Experience**: Project Lead, Pulse Group, London, 2014
A 500sqm two-floor interactive museum at Greenwich Peninsula, featuring four flight simulators, a large-scale A380 nose cone, a Rolls-Royce Trent 900 engine, and a 360° hologram. Kimber led a handbuilt team of 40 on a £7 million project.

**Emirates Sports Sponsorship**: Senior Producer, Pulse Group, Global, 2012–2015
A multi-year global sports sponsorship programme spanning some of the world's most prestigious tournaments. ATP Tennis Tour activations across Wimbledon (London), Roland Garros (Paris), Barcelona Open, US Open (New York), Indian Wells, and Rome. PGA Golf activations in Dubai, Kuala Lumpur, and Shanghai. On-the-ground delivery for the Cricket World Cup across Australia and New Zealand, and the Commonwealth Games in Glasgow. Each activation was developed as a portable touring kit, with Kimber producing between 10 and 18 events per calendar year.

**NTT Data, British Open**: Senior Producer, Pulse Group, London, 2013
The NTT Data Wall transformed live R&A data into a fully animated, data-rich visual experience on a large-scale LED screen, alongside a digital second-screen experience for remote fans.

**Mastercard UEFA Champions League**: Senior Producer, Octagon, Milan, 2016
On-site in Milan for the UEFA Champions League Final, Kimber delivered Mastercard's fan experience activation, including giveaways, priceless surprises, and branded fan journey touchpoints across the city.

**Mastercard British Open Golf**: Senior Producer, Octagon, Troon, 2016
Fan activation delivered for Mastercard at the British Open Golf at Royal Troon, Scotland.

**Visa FIFA Women's World Cup**: Executive Producer, BMF, Paris, 2019
[Kimber to add description]

**EA Sports Battlefront II**: Senior Producer, Amplify, London, 2017
[Kimber to add description]

**SoundCloud**: Senior Producer, Amplify, London, 2017
[Kimber to add description]

**Johnson & Johnson Mobile Laboratory**: Executive Producer, K&K Productions, Sydney, 2021
A touring laboratory designed and delivered for Johnson & Johnson Medical. It was a solar-powered trailer featuring a fully equipped laboratory, conference room, and VR suite, showcasing their latest robot-assisted knee surgery machine to healthcare professionals across Australia.

**Expo 2020 National Day**: Project Lead, Curiious, Dubai, 2021
Dubai's Golden Jubilee celebration at Expo 2020: content production for a 25,380sqm projection surface using 252 projectors across 84 video channels. Kimber produced nearly a petabyte of content for the domed plaza installation.

**Samsung Galaxy A5**: Senior Producer, Imagination, Sydney, 2017
A touring experiential activation promoting the Samsung Galaxy A5, visiting five cities along Australia's east coast. Fully mobile, packing into a single 40-foot semi-trailer.

**Parrtjima Festival**: Creative Technologist, AGB Events, Alice Springs, 2021
Australia's only authentic Aboriginal light festival, set against the MacDonnell Ranges. Kimber worked as Creative Technologist bringing artists' visions to life through structure and sculpture in a dynamic nighttime desert environment.

**Microsoft x London College of Fashion**: We Are Listen, New York, 2019
[Kimber to add description]

**Rizla**: Producer, Exposure, London, 2011
Rizlab, Experiments in Music, was a brand platform funding creative visions of pioneering music artists. Featured Jamie XX, Quayola, Friendly Fires, and Ghost Poet. Direct event reach increased 600% year-on-year, reaching half a million people. PR reach exceeded 16.5 million.

**Aqua Rugby Australia**: Executive Producer, Sydney, 2024
Full-contact rugby union played on a 30x30m floating pitch in Darling Harbour, Sydney. Kimber led event curation and delivery, developing revenue strategies, designing infrastructure, and ensuring safety for players and spectators.

**Gunpowder Plot**: Executive Producer, Independent, London, 2020
A permanent immersive theatre experience beneath the Tower of London. Kimber managed storyline design and development, and the physical UX design of each room, collaborating with the director and head of technical.

---

## 8. Image Folder Summary

All image folders the developer must create (Kimber drops images in):

```
/public/
  images/
    work/
      google-cloud-summit-2025/
      google-cloud-summit-2024/
      netflix-stranger-things/
      canva-studio/
      geely-auto/
      xerocon-nashville/
      visa-everywhere/
      google-pixel-3/
      aperol-spritz/
      stella-mccartney-cop28/
      mastercard-ucl/
      mastercard-british-open/
      mtv-ema/
      emirates-aviation/
      emirates-sports/
      ntt-data/
      ea-sports-battlefront/
      soundcloud/
      johnson-johnson/
      expo-2020/
      samsung-galaxy-a5/
      parrtjima/
      microsoft-lcf/
      rizla/
      aqua-rugby/
      gunpowder-plot/
    logos/
      clients/
      agencies/
    about/
      portrait.jpg
```

Each work folder should contain:
- `hero.jpg`: primary image used in gallery grid and project page header
- `01.jpg`, `02.jpg`, `03.jpg` etc: gallery images

Recommended image specs:
- Hero: 1920x1080px minimum, JPG, <500kb (Next.js will optimise)
- Gallery: 1200x800px minimum
- Logos: SVG preferred, or PNG with transparent background

---

## 9. Design Direction

- **Theme**: Dark. Near-black background, white/off-white body text
- **Accent**: Single accent colour throughout. Developer to propose 2–3 options for Kimber to choose.
- **Typography**: Bold, distinctive display font for headings. Refined, highly legible body font. Not Inter, Roboto, or Arial.
- **Icons**: Lucide React throughout
- **Motion**: Subtle. Page load fade-ins, hover states on cards, smooth map interactions. Nothing that delays content or feels gratuitous.
- **Layout**: Strong grid discipline. Generous negative space. Bold typographic moments. Nothing decorative that isn't functional.
- **Mobile**: Fully responsive. Mobile experience must be as considered as desktop.

---

## 10. Out of Scope (for this build)

- Blog or news section
- Password-protected pages
- Contact form (direct email/phone only)
- CMS admin interface (can be added later)
- Social media feeds
- Video hosting (link to Vimeo/YouTube if needed, no self-hosted video)
- Multi-language

---

## 11. Ongoing maintenance

1. **Content:** edit JSON in `data/` — see [CONTENT.md](CONTENT.md)
2. **Images:** `public/images/work/[slug]/` — hero + numbered gallery JPGs
3. **Logos:** `npm run sync:logos` / `sync:agency-logos` and update `clients.json` / `agencies.json`
4. **Deploy:** `npm run pages:deploy` — see [DEPLOY.md](DEPLOY.md)
5. **Copy gaps:** search `projects.json` for `[Kimber to add description]` and fill in
6. **Email signature:** `email-signature/` — [DEPLOY.md](../email-signature/DEPLOY.md)

---

*Brief version 1.0, May 2026 — archived as reference; site is live.*
