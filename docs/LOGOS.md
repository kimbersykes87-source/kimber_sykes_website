# Client & agency logos — update guide

Step-by-step plan for adding, replacing, or reordering brand and agency marks on [kimbersykes.com](https://kimbersykes.com).

**Related:** [CONTENT.md](CONTENT.md) (data overview) · [brief.md](brief.md) (original spec)

---

## Changelog (24 May 2026)

### Client logos — new `resources/logo-sources/` masters

Re-synced via `SOURCE_SVG` in `scripts/sync-client-logos.mjs`:

| `id` | Source file |
|------|-------------|
| `aperol` | `Aperol.svg` |
| `emirates` | `Emirates_Airlines.svg` |
| `emirates-skycargo` | `Emirates_SkyCargo.svg` |
| `google-cloud` | `google-cloud.svg` |
| `mastercard` | `mastercard.svg` (replaces Simple Icons) |
| `johnson-johnson` | `johnsonandjohnson.svg` |
| `peugeot` | `peugot.svg` |
| `rizla` | `Rizla.svg` |
| `stella-mccartney` | `stellamcartney.svg` (compound path; `fill-rule="evenodd"` in sync post-step) |
| `tiger` | `tiger.svg` |

### Removed from site

| Type | `id` | Notes |
|------|------|--------|
| Client | `scottish-water` | Removed from `clients.json` and `public/images/logos/clients/` |
| Client | `telstra` | Removed from `clients.json` and `public/images/logos/clients/` |
| Agency | `dae` | Removed from `agencies.json`; raster job removed from `embed-agency-raster-svg.mjs` |

### Home Brands marquee

- `lib/marquee.ts` orders the loop: **featured work clients first** (from `featured.json`), then **May 2026 refreshed SVGs**, then the rest of `clients.json`.
- `LogoMarquee` uses `getMarqueeClients()`; seamless scroll unchanged (`LogoMarqueeTrack`).

### Counts

- **46** client logos in `data/clients.json` (home “Global Brands” stat uses `MARQUEE_CLIENT_IDS.length` in `lib/marquee.ts` — all registered clients).
- **17** agency logos in `data/agencies.json`.

After edits: `npm run sync:logos` (and agency commands if needed), then `npm run pages:deploy`.

---

## 1. Where logos appear

| Location | Data source | Notes |
|----------|-------------|--------|
| **Home — Brands marquee** | `lib/marquee.ts` (`getMarqueeClients`) | All 46 clients; featured work + refreshed logos first, then `clients.json` order |
| **Who page — Brands grid** | `data/clients.json` (array order) | All entries in JSON |
| **Who page — Agencies grid** | `data/agencies.json` (array order) | All entries |
| **Home — Agency marquee** | `data/agencies.json` | Same order as Who page |
| **Map side panel** | `data/map.json` → `lib/clientLogo.ts` | Matches client name to logo by label |

**Visual rule:** All marks are shown **white / light on dark** via the `logo-on-dark` CSS class. Source artwork should be high-contrast vector (or converted to white).

---

## 2. Folder layout

```
data/
  clients.json          ← register each client logo (id, name, file, alt)
  agencies.json         ← register each agency logo

public/images/logos/
  clients/              ← deployed client SVGs: {id}.svg
  clients/_archive/     ← old EPS/AI exports (sync script may read from here)
  agencies/             ← deployed agency SVGs (some legacy .png remain)
  bundled/              ← optional shared wordmarks (e.g. google.svg)

resources/
  logo-sources/         ← your master SVG/EPS for clients (not deployed)
  agency-rasters/       ← PNG/JPEG masters for raster→SVG agency pipeline
```

**Do not** commit huge raw exports into `public/` unless needed. Prefer `resources/logo-sources/` then run sync scripts.

---

## 3. Naming rules (`id`)

Use **lowercase kebab-case** matching the filename (without extension):

| Display name | `id` | File |
|--------------|------|------|
| Google | `google` | `google.svg` |
| Johnson & Johnson | `johnson-johnson` | `johnson-johnson.svg` |
| EA Sports | `ea-sports` | `ea-sports.svg` |
| Geely Auto | `geely` | `geely.svg` |

`data/clients.json` / `data/agencies.json` **`file`** path must match:

```json
"/images/logos/clients/{id}.svg"
"/images/logos/agencies/{id}.svg"
```

---

## 4. Prerequisites (Windows)

Client sync from EPS/AI needs:

1. **ImageMagick 7** (`magick.exe`) — [imagemagick.org](https://imagemagick.org/)
2. **Ghostscript** — for EPS/AI conversion

If `npm run sync:logos` cannot find ImageMagick, set:

```powershell
$env:MAGICK_EXE = "C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"
```

Agency raster embedding (`build:agency-raster-svgs`) uses the same `MAGICK_EXE` default path in the script.

---

## 5. Plan A — Update an existing client logo

### Step 1 — Get a good source file

**Best:** SVG vector from brand guidelines (single colour or easy to recolour).

**Also OK:** EPS/AI in `resources/logo-sources/` or `public/images/logos/clients/_archive/`.

**Avoid if possible:** Low-res PNG/JPG (will look soft in the marquee).

### Step 2 — Drop the source in the right place

| Source type | Where to put it |
|-------------|-----------------|
| SVG you control | `resources/logo-sources/YourBrand.svg` |
| EPS/AI only | `resources/logo-sources/` or `_archive/` |
| Already have final white SVG | `public/images/logos/clients/{id}.svg` directly |

If the sync script should prefer your file, add a mapping in `scripts/sync-client-logos.mjs`:

```js
const SOURCE_SVG = {
  // ...
  "your-id": "YourBrand.svg",
};
```

For brands on [Simple Icons](https://simpleicons.org/), the script can auto-build from the library if the `id` is listed in `SI_KEY` in the same file (e.g. `netflix`, `visa`, `cnn`).

### Step 3 — Run client sync

```bash
npm run sync:logos
```

This writes/overwrites `public/images/logos/clients/{id}.svg` (white treatment, trimmed).

### Step 4 — Check locally

```bash
npm run dev
```

Open:

- http://localhost:3000/clients (full grid)
- http://localhost:3000/ (home marquee — all `clients.json` entries)

### Step 5 — Deploy

```bash
npm run pages:deploy
```

---

## 6. Plan B — Add a new client logo

Use this checklist in order.

- [ ] **1. Choose `id`** (kebab-case, unique).
- [ ] **2. Add source** under `resources/logo-sources/` (or configure `SI_KEY` / `SOURCE_SVG` in `sync-client-logos.mjs`).
- [ ] **3. Append to `data/clients.json`:**

```json
{
  "id": "arise-fashion",
  "name": "Arise Fashion",
  "file": "/images/logos/clients/arise-fashion.svg",
  "alt": "Arise Fashion"
}
```

Optional — if the mark looks small next to others:

```json
"displayScale": 1.5
```

(Used today for Stella McCartney and Xero.)

- [ ] **4. Run** `npm run sync:logos`
- [ ] **5. Home marquee** — every `clients.json` entry appears on the home strip (`MARQUEE_CLIENT_IDS` in `lib/marquee.ts`). Reorder by reordering `clients.json`.
- [ ] **6. Map panel (optional)** — if `map.json` uses a different client string, add an alias in `lib/clientLogo.ts`:

```ts
const ID_BY_CLIENT_LABEL: Record<string, string> = {
  "arise fashion": "arise-fashion",
};
```

- [ ] **7. Preview** `/clients` and `/`
- [ ] **8. Deploy** `npm run pages:deploy`

### Brands on your CV not yet on the site

From CV vs `clients.json` (as of early 2026), likely additions if you want parity:

| Brand | Suggested `id` | Notes |
|-------|----------------|--------|
| Aqua Rugby Australia | `aqua-rugby` | Case study exists |
| Arise Fashion | `arise-fashion` | Map only today |
| Expo 2020 / Dubai World Expo | `expo-2020` | Case study exists |
| Gunpowder Plot | `gunpowder-plot` | Case study |
| Bentley, dnata, DP World, etc. | — | Archive EPS may exist under `_archive/` |

---

## 7. Plan C — Update an existing agency logo

### Path 1 — You have an SVG export (Figma, Illustrator, etc.)

1. Save/export as SVG.
2. Copy into `public/images/logos/agencies/` using either:
   - **Canonical name:** `{id}.svg` (e.g. `wonder.svg`), or
   - **Incoming name:** `Wonder_<export-id>.svg` — `sync-agency-logos` renames and whitens automatically (see `INCOMING_PREFIXES` in `scripts/sync-agency-logos.mjs`).
3. Run:

```bash
npm run sync:agency-logos
```

4. Ensure `data/agencies.json` points at `/images/logos/agencies/{id}.svg`.
5. Preview `/clients` (agencies section) and home agency marquee.

### Path 2 — You only have PNG/JPEG

1. Place master in `resources/agency-rasters/` (e.g. `exposure.png`).
2. Add or edit a job in `scripts/embed-agency-raster-svg.mjs` (`file`, `dest`, `label`, `fuzz`, `transparent`, optional `whiteForeground`).
3. Run:

```bash
npm run build:agency-raster-svgs
npm run sync:agency-logos
```

4. Update `agencies.json` to use the new `.svg` path if it changed.

### Path 3 — No artwork yet

`sync:agency-logos` generates a **white text wordmark** SVG for any `agencies.json` row missing a file — fine as a placeholder until real art arrives.

### Agencies on CV not in `agencies.json`

| Agency | Action |
|--------|--------|
| dotdotdot | Add row + source |
| Ellipsis | Optional (Gunpowder Plot credit) |

---

## 8. Plan D — Add a new agency

- [ ] **1. Pick `id`** (e.g. `new-agency`).
- [ ] **2. Add to `data/agencies.json`:**

```json
{
  "id": "new-agency",
  "name": "New Agency",
  "file": "/images/logos/agencies/new-agency.svg",
  "alt": "New Agency"
}
```

- [ ] **3. Add SVG** (Path 1 or 2 above) or run `sync:agency-logos` for text fallback.
- [ ] **4. If using incoming Figma names**, add to `INCOMING_PREFIXES` in `sync-agency-logos.mjs`:

```js
["new-agency", /^NewAgency_/i],
```

- [ ] **5. Preview** `/clients` + home agency strip (order = JSON order).
- [ ] **6. Deploy**

**Note:** INVNT, BMF, and AGB Events use `.svg` paths in JSON (built from `resources/agency-rasters/` via `build:agency-raster-svgs`).

---

## 9. Reordering logos

| Page | How to reorder |
|------|----------------|
| Who — Brands | Reorder objects in `data/clients.json` |
| Who — Agencies | Reorder objects in `data/agencies.json` |
| Home — Brands marquee | Reorder `data/clients.json` (`MARQUEE_CLIENT_IDS` = all clients) |
| Home — Agencies | Same as `agencies.json` (no separate list) |

No script required for reorder-only changes.

---

## 10. Quality checklist (before deploy)

- [ ] Logo reads clearly at **marquee size** (~32–40px height).
- [ ] No coloured fills left (should be white on dark).
- [ ] `alt` text matches brand name for accessibility.
- [ ] `id` and filename match.
- [ ] `npm run build` passes.
- [ ] Spot-check `/clients`, `/`, and one map country with that client.

---

## 11. Command reference

| Command | When to use |
|---------|-------------|
| `npm run sync:logos` | Regenerate all **client** SVGs from sources / Simple Icons / EPS |
| `npm run sync:agency-logos` | Import/whiten **agency** SVGs; text fallbacks |
| `npm run build:agency-raster-svgs` | Convert `resources/agency-rasters/*` → agency SVGs |
| `npm run dev` | Local preview |
| `npm run pages:deploy` | Production |

**Typical full logo refresh:**

```bash
npm run sync:logos
npm run build:agency-raster-svgs
npm run sync:agency-logos
npm run dev
```

---

## 12. Troubleshooting

| Problem | Likely fix |
|---------|------------|
| `magick` not found | Install ImageMagick or set `MAGICK_EXE` |
| EPS fails to convert | Install Ghostscript; check EPS opens in Illustrator |
| Logo too small/large | Set `"displayScale": 1.25` or `1.5` in `clients.json` |
| Map shows initials, not logo | Add alias in `lib/clientLogo.ts` (`ID_BY_CLIENT_LABEL`) |
| Wrong logo on home but OK on Who | Check `clients.json` order and `displayScale`; marquee lists all clients |
| Sync overwrote a hand-tuned SVG | Put master in `resources/logo-sources/` and map in `SOURCE_SVG`; re-run sync |
| Agency import ignored | Filename must match `INCOMING_PREFIXES` or be exactly `{id}.svg` |

---

## 13. Files you may need to edit (summary)

| Task | Files |
|------|--------|
| Register client | `data/clients.json` |
| Register agency | `data/agencies.json` |
| Client source priority | `scripts/sync-client-logos.mjs` (`SOURCE_SVG`, `SI_KEY`, `CLIENT_SVG_POST`) |
| Agency import naming | `scripts/sync-agency-logos.mjs` (`INCOMING_PREFIXES`) |
| Agency raster pipeline | `scripts/embed-agency-raster-svg.mjs`, `resources/agency-rasters/` |
| Home client strip order | `components/LogoMarquee.tsx` |
| Map name → logo | `lib/clientLogo.ts` |
| Visual scale | `clients.json` → `displayScale`; logic in `lib/logoDisplay.ts` |

---

## 14. Suggested workflow (one sitting)

1. List brands/agencies to add or refresh (use CV + `docs/LOGOS.md` §6 table).
2. Collect SVGs into `resources/logo-sources/` and agency art into `resources/agency-rasters/` or `public/.../agencies/`.
3. Update `clients.json` / `agencies.json`.
4. Update `sync-client-logos.mjs` mappings for any non-obvious filenames.
5. Run sync commands (§11).
6. Adjust `clients.json` order, `displayScale`, and `clientLogo.ts` aliases.
7. `npm run dev` → review `/clients` and `/`.
8. `npm run pages:deploy`.
