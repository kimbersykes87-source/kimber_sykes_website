/**
 * Monday 08:00 UTC: aggregate AI + human visits from D1, send HTML table report (Resend).
 */
import {
  buildHtmlReport,
  pctChange,
  type CountRow,
  type GeoRow,
  type PathRow,
} from "./report-html";

export interface Env {
  DB: D1Database;
  REPORT_TO_EMAIL: string;
  REPORT_FROM_EMAIL: string;
  RESEND_API_KEY: string;
  MANUAL_TRIGGER_SECRET?: string;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryLabel(code: string): string {
  const c = code.trim();
  if (!c) return "Unknown";
  try {
    return regionNames.of(c.toUpperCase()) ?? c;
  } catch {
    return c;
  }
}

async function countCrawler(env: Env, since: string, until?: string): Promise<number> {
  const q = until
    ? "SELECT COUNT(*) as c FROM crawler_visits WHERE ts >= ? AND ts < ?"
    : "SELECT COUNT(*) as c FROM crawler_visits WHERE ts >= ?";
  const stmt = env.DB.prepare(q);
  const row = until
    ? await stmt.bind(since, until).first<{ c: number }>()
    : await stmt.bind(since).first<{ c: number }>();
  return Number(row?.c ?? 0);
}

async function countHuman(env: Env, since: string, until?: string): Promise<number> {
  const q = until
    ? "SELECT COUNT(*) as c FROM human_visits WHERE ts >= ? AND ts < ?"
    : "SELECT COUNT(*) as c FROM human_visits WHERE ts >= ?";
  const stmt = env.DB.prepare(q);
  const row = until
    ? await stmt.bind(since, until).first<{ c: number }>()
    : await stmt.bind(since).first<{ c: number }>();
  return Number(row?.c ?? 0);
}

async function countUniqueVisitors(env: Env, since: string, until?: string): Promise<number> {
  // Visitor IDs rotate daily, so this is the sum of daily uniques (a returning visitor counts once per day).
  const q = until
    ? "SELECT COUNT(*) as c FROM (SELECT DISTINCT substr(ts,1,10), visitor_id FROM human_visits WHERE visitor_id IS NOT NULL AND ts >= ? AND ts < ?)"
    : "SELECT COUNT(*) as c FROM (SELECT DISTINCT substr(ts,1,10), visitor_id FROM human_visits WHERE visitor_id IS NOT NULL AND ts >= ?)";
  const stmt = env.DB.prepare(q);
  const row = until
    ? await stmt.bind(since, until).first<{ c: number }>()
    : await stmt.bind(since).first<{ c: number }>();
  return Number(row?.c ?? 0);
}

async function filteredWithWoW(env: Env, weekAgo: string, twoWeeksAgo: string): Promise<CountRow[]> {
  const rows = await env.DB.prepare(
    `SELECT reason,
            SUM(CASE WHEN ts >= ? THEN 1 ELSE 0 END) as this_c,
            SUM(CASE WHEN ts < ? THEN 1 ELSE 0 END) as prev_c
     FROM filtered_visits WHERE ts >= ? GROUP BY reason ORDER BY this_c DESC`,
  )
    .bind(weekAgo, weekAgo, twoWeeksAgo)
    .all<{ reason: string; this_c: number; prev_c: number }>();
  return (rows.results ?? []).map((r) => ({
    label: FILTER_LABELS[r.reason] ?? r.reason,
    thisWeek: Number(r.this_c),
    prevWeek: Number(r.prev_c),
  }));
}

const FILTER_LABELS: Record<string, string> = {
  probe_path: "Scanner probes (.env, .git, wp-login, API)",
  automated_ua: "Automated / non-browser User-Agent",
  no_ua: "No User-Agent",
  not_html_accept: "Did not ask for HTML",
  not_document: "Not a page navigation",
  self: "You (ks_self cookie)",
  status_404: "404 Not found",
  status_301: "Redirect (301)",
  status_302: "Redirect (302)",
  status_304: "Not modified (304)",
  status_308: "Redirect (308)",
};

async function botsWithWoW(
  env: Env,
  weekAgo: string,
  now: string,
  twoWeeksAgo: string,
): Promise<{ bot: string; thisWeek: number; prevWeek: number }[]> {
  const thisBots = await env.DB.prepare(
    `SELECT bot_name as bot, COUNT(*) as c FROM crawler_visits
     WHERE ts >= ? GROUP BY bot_name`,
  )
    .bind(weekAgo)
    .all<{ bot: string; c: number }>();

  const prevBots = await env.DB.prepare(
    `SELECT bot_name as bot, COUNT(*) as c FROM crawler_visits
     WHERE ts >= ? AND ts < ? GROUP BY bot_name`,
  )
    .bind(twoWeeksAgo, weekAgo)
    .all<{ bot: string; c: number }>();

  const prevMap = new Map((prevBots.results ?? []).map((r) => [r.bot, Number(r.c)]));
  const names = new Set<string>();
  for (const r of thisBots.results ?? []) names.add(r.bot);
  for (const r of prevBots.results ?? []) names.add(r.bot);

  return [...names]
    .map((bot) => ({
      bot,
      thisWeek: Number((thisBots.results ?? []).find((r) => r.bot === bot)?.c ?? 0),
      prevWeek: prevMap.get(bot) ?? 0,
    }))
    .sort((a, b) => b.thisWeek - a.thisWeek);
}

async function geoWithWoW(env: Env, weekAgo: string, twoWeeksAgo: string): Promise<GeoRow[]> {
  const thisGeo = await env.DB.prepare(
    `SELECT country, city, region, COUNT(*) as c FROM human_visits
     WHERE ts >= ? GROUP BY country, city, region`,
  )
    .bind(weekAgo)
    .all<{ country: string; city: string; region: string; c: number }>();

  const prevGeo = await env.DB.prepare(
    `SELECT country, city, region, COUNT(*) as c FROM human_visits
     WHERE ts >= ? AND ts < ? GROUP BY country, city, region`,
  )
    .bind(twoWeeksAgo, weekAgo)
    .all<{ country: string; city: string; region: string; c: number }>();

  const key = (r: { country: string; city: string; region: string }) =>
    `${r.country}|${r.city}|${r.region}`;
  const prevMap = new Map((prevGeo.results ?? []).map((r) => [key(r), Number(r.c)]));
  const keys = new Set<string>();
  for (const r of thisGeo.results ?? []) keys.add(key(r));
  for (const r of prevGeo.results ?? []) keys.add(key(r));

  return [...keys]
    .map((k) => {
      const [country, city, region] = k.split("|");
      const thisRow = (thisGeo.results ?? []).find((r) => key(r) === k);
      return {
        country: country ?? "",
        city: city ?? "",
        region: region ?? "",
        thisWeek: Number(thisRow?.c ?? 0),
        prevWeek: prevMap.get(k) ?? 0,
      };
    })
    .sort((a, b) => b.thisWeek - a.thisWeek)
    .slice(0, 25);
}

async function topPaths(
  env: Env,
  table: "crawler_visits" | "human_visits",
  since: string,
  limit: number,
): Promise<PathRow[]> {
  const rows = await env.DB.prepare(
    `SELECT path, COUNT(*) as c FROM ${table} WHERE ts >= ? GROUP BY path ORDER BY c DESC LIMIT ?`,
  )
    .bind(since, limit)
    .all<{ path: string; c: number }>();
  return (rows.results ?? []).map((r) => ({ path: r.path, c: Number(r.c) }));
}

function buildPlainText(opts: {
  windowStart: string;
  windowEnd: string;
  summary: CountRow[];
  bots: { bot: string; thisWeek: number; prevWeek: number }[];
  geo: GeoRow[];
  filtered: CountRow[];
}): string {
  const lines: string[] = [
    `kimbersykes.com: Weekly Traffic Report ${opts.windowEnd.slice(0, 10)}`,
    `Window (UTC): ${opts.windowStart} → ${opts.windowEnd}`,
    "",
    "AI vs human:",
    ...opts.summary.map((r) => {
      const ch = pctChange(r.thisWeek, r.prevWeek);
      return `  ${r.label}: ${r.thisWeek} (was ${r.prevWeek}, ${ch.label})`;
    }),
    "",
    "AI crawlers (ranked):",
    ...opts.bots.map((b, i) => {
      const ch = pctChange(b.thisWeek, b.prevWeek);
      return `  ${i + 1}. ${b.bot}: ${b.thisWeek} (was ${b.prevWeek}, ${ch.label})`;
    }),
    "",
    "Human locations:",
    ...opts.geo.map((g, i) => {
      const ch = pctChange(g.thisWeek, g.prevWeek);
      const place = [g.city, g.region].filter(Boolean).join(", ") || "—";
      return `  ${i + 1}. ${countryLabel(g.country)} (${place}): ${g.thisWeek} (${ch.label})`;
    }),
    "",
    "Filtered out (not counted as human):",
    ...opts.filtered.map((r) => {
      const ch = pctChange(r.thisWeek, r.prevWeek);
      return `  ${r.label}: ${r.thisWeek} (was ${r.prevWeek}, ${ch.label})`;
    }),
  ];
  return lines.join("\n");
}

async function buildReport(env: Env): Promise<{ html: string; text: string }> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const since = weekAgo.toISOString();
  const untilPrev = weekAgo.toISOString();
  const sincePrev = twoWeeksAgo.toISOString();

  const aiThis = await countCrawler(env, since);
  const aiPrev = await countCrawler(env, sincePrev, untilPrev);
  const humanThis = await countHuman(env, since);
  const humanPrev = await countHuman(env, sincePrev, untilPrev);
  const uniqueThis = await countUniqueVisitors(env, since);
  const uniquePrev = await countUniqueVisitors(env, sincePrev, untilPrev);

  const summary: CountRow[] = [
    { label: "AI crawler requests", thisWeek: aiThis, prevWeek: aiPrev },
    { label: "Human page views", thisWeek: humanThis, prevWeek: humanPrev },
    { label: "Unique human visitors (daily)", thisWeek: uniqueThis, prevWeek: uniquePrev },
  ];

  const filtered = await filteredWithWoW(env, since, sincePrev);

  const bots = await botsWithWoW(env, since, now.toISOString(), sincePrev);
  const geo = await geoWithWoW(env, since, sincePrev);
  const humanPaths = await topPaths(env, "human_visits", since, 5);
  const aiPaths = await topPaths(env, "crawler_visits", since, 5);

  const reportOpts = {
    windowStart: since,
    windowEnd: now.toISOString(),
    summary,
    bots,
    geo,
    humanPaths,
    aiPaths,
    filtered,
    countryLabel,
  };

  return {
    html: buildHtmlReport(reportOpts),
    text: buildPlainText(reportOpts),
  };
}

async function sendReport(env: Env, html: string, text: string): Promise<void> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set on the Worker");
  }

  const subject = `kimbersykes.com: Weekly Traffic Report ${isoDate(new Date())}`;
  const from = `kimbersykes.com traffic <${env.REPORT_FROM_EMAIL.trim()}>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [env.REPORT_TO_EMAIL.trim()],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Resend HTTP ${res.status}: ${t.slice(0, 500)}`);
  }
}

async function runWeeklyReport(env: Env): Promise<void> {
  const { html, text } = await buildReport(env);
  await sendReport(env, html, text);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/trigger" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }
    const secret = env.MANUAL_TRIGGER_SECRET?.trim();
    const key = request.headers.get("x-weekly-report-key");
    if (!secret || key !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      await runWeeklyReport(env);
      return new Response("Weekly report sent", { status: 200 });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("weekly-report failed:", msg);
      return new Response(msg, { status: 500 });
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runWeeklyReport(env).catch((e) => console.error("weekly-report failed:", e)));
  },
};
