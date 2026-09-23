export type CountRow = { label: string; thisWeek: number; prevWeek: number };

export type GeoRow = {
  country: string;
  city: string;
  region: string;
  thisWeek: number;
  prevWeek: number;
};

export type PathRow = { path: string; c: number };

const PASTEL_UP = { bg: "#d4edda", text: "#1e4620" };
const PASTEL_DOWN = { bg: "#f8d7da", text: "#721c24" };
const PASTEL_FLAT = { bg: "#f0f0f0", text: "#333333" };

export function pctChange(thisWeek: number, prevWeek: number): {
  label: string;
  bg: string;
  color: string;
} {
  if (prevWeek === 0) {
    if (thisWeek === 0) {
      return { label: "—", bg: PASTEL_FLAT.bg, color: PASTEL_FLAT.text };
    }
    return { label: "new", bg: PASTEL_UP.bg, color: PASTEL_UP.text };
  }
  const pct = Math.round(((thisWeek - prevWeek) / prevWeek) * 100);
  const sign = pct > 0 ? "+" : "";
  if (pct > 0) {
    return { label: `${sign}${pct}%`, bg: PASTEL_UP.bg, color: PASTEL_UP.text };
  }
  if (pct < 0) {
    return { label: `${sign}${pct}%`, bg: PASTEL_DOWN.bg, color: PASTEL_DOWN.text };
  }
  return { label: "0%", bg: PASTEL_FLAT.bg, color: PASTEL_FLAT.text };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function changeCell(thisWeek: number, prevWeek: number): string {
  const ch = pctChange(thisWeek, prevWeek);
  return `<td style="background:${ch.bg};color:${ch.color};font-weight:600;text-align:center;padding:8px 10px;">${esc(ch.label)}</td>`;
}

function tableWrap(inner: string): string {
  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:640px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;margin:12px 0 20px;">${inner}</table>`;
}

function th(text: string, align: "left" | "center" | "right" = "left"): string {
  return `<th style="text-align:${align};padding:10px 12px;background:#1a1a1a;color:#f5f5f4;font-weight:600;border-bottom:2px solid #38bdf8;">${esc(text)}</th>`;
}

function td(text: string, align: "left" | "center" | "right" = "left"): string {
  return `<td style="text-align:${align};padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#1a1a1a;">${text}</td>`;
}

function rankCell(n: number): string {
  return td(String(n), "center");
}

export function buildSummaryTable(rows: CountRow[]): string {
  const body = rows
    .map((r, i) => {
      const stripe = i % 2 === 0 ? "#fafafa" : "#ffffff";
      return `<tr style="background:${stripe};">
        ${td(`<strong>${esc(r.label)}</strong>`)}
        ${td(String(r.thisWeek), "right")}
        ${td(String(r.prevWeek), "right")}
        ${changeCell(r.thisWeek, r.prevWeek)}
      </tr>`;
    })
    .join("");

  return tableWrap(`
    <thead><tr>
      ${th("Traffic")}
      ${th("This week", "right")}
      ${th("Prior week", "right")}
      ${th("Change", "center")}
    </tr></thead>
    <tbody>${body}</tbody>
  `);
}

export function buildRankedBotTable(
  bots: { bot: string; thisWeek: number; prevWeek: number }[],
): string {
  if (!bots.length) {
    return `<p style="color:#666;font-size:14px;">No AI crawler hits in this window.</p>`;
  }

  const body = bots
    .map((r, i) => {
      const stripe = i % 2 === 0 ? "#fafafa" : "#ffffff";
      return `<tr style="background:${stripe};">
        ${rankCell(i + 1)}
        ${td(esc(r.bot))}
        ${td(String(r.thisWeek), "right")}
        ${td(String(r.prevWeek), "right")}
        ${changeCell(r.thisWeek, r.prevWeek)}
      </tr>`;
    })
    .join("");

  return tableWrap(`
    <thead><tr>
      ${th("#", "center")}
      ${th("AI crawler")}
      ${th("This week", "right")}
      ${th("Prior week", "right")}
      ${th("Change", "center")}
    </tr></thead>
    <tbody>${body}</tbody>
  `);
}

export function buildGeoTable(rows: GeoRow[], countryLabel: (code: string) => string): string {
  if (!rows.length) {
    return `<p style="color:#666;font-size:14px;">No human page views logged in this window (HTML pages only).</p>`;
  }

  const body = rows
    .map((r, i) => {
      const stripe = i % 2 === 0 ? "#fafafa" : "#ffffff";
      const country = countryLabel(r.country || "");
      const city = r.city?.trim() || "—";
      const region = r.region?.trim();
      const place =
        region && region !== city ? `${esc(city)}, ${esc(region)}` : esc(city);
      return `<tr style="background:${stripe};">
        ${rankCell(i + 1)}
        ${td(esc(country))}
        ${td(place)}
        ${td(String(r.thisWeek), "right")}
        ${td(String(r.prevWeek), "right")}
        ${changeCell(r.thisWeek, r.prevWeek)}
      </tr>`;
    })
    .join("");

  return tableWrap(`
    <thead><tr>
      ${th("#", "center")}
      ${th("Country")}
      ${th("City")}
      ${th("This week", "right")}
      ${th("Prior week", "right")}
      ${th("Change", "center")}
    </tr></thead>
    <tbody>${body}</tbody>
  `);
}

export function buildPathTable(title: string, paths: PathRow[]): string {
  if (!paths.length) {
    return "";
  }
  const body = paths
    .map((r, i) => {
      const stripe = i % 2 === 0 ? "#fafafa" : "#ffffff";
      return `<tr style="background:${stripe};">
        ${rankCell(i + 1)}
        ${td(`<code style="font-size:12px;">${esc(r.path)}</code>`)}
        ${td(String(r.c), "right")}
      </tr>`;
    })
    .join("");

  return `
    <h2 style="font-size:16px;color:#1a1a1a;margin:24px 0 8px;">${esc(title)}</h2>
    ${tableWrap(`
      <thead><tr>
        ${th("#", "center")}
        ${th("Path")}
        ${th("Views", "right")}
      </tr></thead>
      <tbody>${body}</tbody>
    `)}
  `;
}

export function buildFilteredTable(rows: CountRow[]): string {
  if (!rows.length) {
    return `<p style="color:#666;font-size:14px;">Nothing filtered in this window.</p>`;
  }
  return buildSummaryTable(rows).replace(">Traffic<", ">Reason<");
}

export function buildHtmlReport(opts: {
  windowStart: string;
  windowEnd: string;
  summary: CountRow[];
  bots: { bot: string; thisWeek: number; prevWeek: number }[];
  geo: GeoRow[];
  humanPaths: PathRow[];
  aiPaths: PathRow[];
  filtered: CountRow[];
  countryLabel: (code: string) => string;
}): string {
  const date = opts.windowEnd.slice(0, 10);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px 16px;background:#f5f5f4;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;border:1px solid #e5e5e5;">
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;">kimbersykes.com</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#666;">Weekly traffic report · ${esc(date)}</p>
    <p style="margin:0 0 16px;font-size:13px;color:#888;">UTC window: ${esc(opts.windowStart)} → ${esc(opts.windowEnd)}</p>

    <h2 style="font-size:16px;color:#1a1a1a;margin:0 0 8px;">AI vs human</h2>
    <p style="margin:0 0 8px;font-size:12px;color:#888;">Unique visitors are counted per day (anonymous daily hash, no cookies), so a person who visits on 3 days counts 3 times.</p>
    ${buildSummaryTable(opts.summary)}

    <h2 style="font-size:16px;color:#1a1a1a;margin:0 0 8px;">AI crawlers (ranked)</h2>
    ${buildRankedBotTable(opts.bots)}

    <h2 style="font-size:16px;color:#1a1a1a;margin:0 0 8px;">Human visitors by location</h2>
    <p style="margin:0 0 8px;font-size:12px;color:#888;">Country and city from Cloudflare edge (best effort). HTML pages only; static assets excluded.</p>
    ${buildGeoTable(opts.geo, opts.countryLabel)}

    ${buildPathTable("Top paths: humans", opts.humanPaths)}
    ${buildPathTable("Top paths: AI crawlers", opts.aiPaths)}

    <h2 style="font-size:16px;color:#1a1a1a;margin:24px 0 8px;">Filtered out (not counted as human)</h2>
    ${buildFilteredTable(opts.filtered)}

    <p style="margin:24px 0 0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px;">
      Logged at the edge on kimbersykes.com. Humans: real browser navigations to pages that returned 200 HTML; probes, 404s, redirects, API calls and non-browser clients are filtered. AI: User-Agents in robots.txt allow-list.
    </p>
  </div>
</body>
</html>`;
}
