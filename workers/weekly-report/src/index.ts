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

async function countBeacon(env: Env, since: string, until?: string): Promise<number> {
  const q = until
    ? "SELECT COUNT(*) as c FROM beacon_views WHERE ts >= ? AND ts < ?"
    : "SELECT COUNT(*) as c FROM beacon_views WHERE ts >= ?";
  const stmt = env.DB.prepare(q);
  const row = until
    ? await stmt.bind(since, until).first<{ c: number }>()
    : await stmt.bind(since).first<{ c: number }>();
  return Number(row?.c ?? 0);
}

async function countUniqueBeaconVisitors(env: Env, since: string, until?: string): Promise<number> {
  const q = until
    ? "SELECT COUNT(*) as c FROM (SELECT DISTINCT substr(ts,1,10), visitor_id FROM beacon_views WHERE visitor_id IS NOT NULL AND ts >= ? AND ts < ?)"
    : "SELECT COUNT(*) as c FROM (SELECT DISTINCT substr(ts,1,10), visitor_id FROM beacon_views WHERE visitor_id IS NOT NULL AND ts >= ?)";
  const stmt = env.DB.prepare(q);
  const row = until
    ? await stmt.bind(since, until).first<{ c: number }>()
    : await stmt.bind(since).first<{ c: number }>();
  return Number(row?.c ?? 0);
}

/** Median and average active (engaged) seconds per verified page view. */
async function activeTime(env: Env, since: string, until?: string): Promise<{ median: number; avg: number }> {
  const where = until
    ? "active_ms IS NOT NULL AND active_ms > 0 AND ts >= ? AND ts < ?"
    : "active_ms IS NOT NULL AND active_ms > 0 AND ts >= ?";
  const binds = until ? [since, until] : [since];
  const agg = await env.DB.prepare(
    `SELECT COUNT(*) as n, AVG(active_ms) as a FROM beacon_views WHERE ${where}`,
  )
    .bind(...binds)
    .first<{ n: number; a: number }>();
  const n = Number(agg?.n ?? 0);
  if (!n) return { median: 0, avg: 0 };
  const mid = await env.DB.prepare(
    `SELECT active_ms as m FROM beacon_views WHERE ${where} ORDER BY active_ms LIMIT 1 OFFSET ?`,
  )
    .bind(...binds, Math.floor((n - 1) / 2))
    .first<{ m: number }>();
  return {
    median: Math.round(Number(mid?.m ?? 0) / 1000),
    avg: Math.round(Number(agg?.a ?? 0) / 1000),
  };
}

/** Networks (hosting providers) behind the most filtered requests. */
async function topFilteredNetworks(env: Env, since: string): Promise<PathRow[]> {
  const rows = await env.DB.prepare(
    `SELECT COALESCE(NULLIF(detail,''),'unknown') as path, COUNT(*) as c FROM filtered_visits
     WHERE reason = 'datacenter' AND ts >= ? GROUP BY path ORDER BY c DESC LIMIT 5`,
  )
    .bind(since)
    .all<{ path: string; c: number }>();
  return (rows.results ?? []).map((r) => ({ path: r.path, c: Number(r.c) }));
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
  datacenter: "Hosting / cloud network (not a person)",
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

async function geoWithWoW(
  env: Env,
  weekAgo: string,
  twoWeeksAgo: string,
  table: "human_visits" | "beacon_views" = "human_visits",
): Promise<GeoRow[]> {
  const thisGeo = await env.DB.prepare(
    `SELECT country, city, region, COUNT(*) as c FROM ${table}
     WHERE ts >= ? GROUP BY country, city, region`,
  )
    .bind(weekAgo)
    .all<{ country: string; city: string; region: string; c: number }>();

  const prevGeo = await env.DB.prepare(
    `SELECT country, city, region, COUNT(*) as c FROM ${table}
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
  table: "crawler_visits" | "human_visits" | "beacon_views",
  since: string,
  limit: number,
): Promise<PathRow[]> {
  const withTime = table === "beacon_views";
  const rows = await env.DB.prepare(
    withTime
      ? `SELECT path, COUNT(*) as c, AVG(active_ms) as ms FROM ${table} WHERE ts >= ? GROUP BY path ORDER BY c DESC LIMIT ?`
      : `SELECT path, COUNT(*) as c, NULL as ms FROM ${table} WHERE ts >= ? GROUP BY path ORDER BY c DESC LIMIT ?`,
  )
    .bind(since, limit)
    .all<{ path: string; c: number; ms: number | null }>();
  return (rows.results ?? []).map((r) => ({
    path: r.path,
    c: Number(r.c),
    activeSeconds: r.ms == null ? undefined : Math.round(Number(r.ms) / 1000),
  }));
}

function buildPlainText(opts: {
  windowStart: string;
  windowEnd: string;
  summary: CountRow[];
  bots: { bot: string; thisWeek: number; prevWeek: number }[];
  geo: GeoRow[];
  filtered: CountRow[];
  networks: PathRow[];
  timing: CountRow[];
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
    "Active time (tab visible and in use):",
    ...opts.timing.map((r) => `  ${r.label}: ${r.thisWeek} (was ${r.prevWeek})`),
    "",
    "Filtered out (not counted as human):",
    ...opts.filtered.map((r) => {
      const ch = pctChange(r.thisWeek, r.prevWeek);
      return `  ${r.label}: ${r.thisWeek} (was ${r.prevWeek}, ${ch.label})`;
    }),
    "",
    "Top hosting networks filtered:",
    ...opts.networks.map((n, i) => `  ${i + 1}. ${n.path}: ${n.c}`),
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
  const beaconThis = await countBeacon(env, since);
  const beaconPrev = await countBeacon(env, sincePrev, untilPrev);
  const verified = beaconThis > 0;
  const uniqueThis = verified
    ? await countUniqueBeaconVisitors(env, since)
    : await countUniqueVisitors(env, since);
  const uniquePrev = beaconPrev > 0
    ? await countUniqueBeaconVisitors(env, sincePrev, untilPrev)
    : await countUniqueVisitors(env, sincePrev, untilPrev);

  const summary: CountRow[] = [
    { label: "AI crawler requests", thisWeek: aiThis, prevWeek: aiPrev },
    { label: "Verified human page views (JavaScript)", thisWeek: beaconThis, prevWeek: beaconPrev },
    { label: "Unique human visitors (daily)", thisWeek: uniqueThis, prevWeek: uniquePrev },
    { label: "Edge-filtered page views (upper bound)", thisWeek: humanThis, prevWeek: humanPrev },
  ];

  const filtered = await filteredWithWoW(env, since, sincePrev);
  const networks = await topFilteredNetworks(env, since);
  const timeThis = await activeTime(env, since);
  const timePrev = await activeTime(env, sincePrev, untilPrev);

  const timing: CountRow[] = [
    { label: "Median active time per page (seconds)", thisWeek: timeThis.median, prevWeek: timePrev.median },
    { label: "Average active time per page (seconds)", thisWeek: timeThis.avg, prevWeek: timePrev.avg },
  ];


  const bots = await botsWithWoW(env, since, now.toISOString(), sincePrev);
  const humanTable = verified ? ("beacon_views" as const) : ("human_visits" as const);
  const geo = await geoWithWoW(env, since, sincePrev, humanTable);
  const humanPaths = await topPaths(env, humanTable, since, 5);
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
    networks,
    timing,
    verified,
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
