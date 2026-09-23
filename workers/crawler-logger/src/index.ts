/**
 * Log-only edge proxy: match AI crawler User-Agents, INSERT into D1, then forward to the Pages origin.
 * Deploy with a Workers route on your hostname (e.g. www.example.com/*) so traffic hits this Worker before Pages.
 *
 * Human page views are logged AFTER the origin responds, and only when:
 *   - the response is a 200 HTML document,
 *   - the request looks like a real browser navigation (Mozilla UA, Accept: text/html,
 *     Sec-Fetch-Dest "document" when the browser sends it),
 *   - the path is not an API call, dotfile, or known scanner probe,
 *   - the request is not from the site owner (ks_self cookie).
 * Everything rejected is counted in filtered_visits by reason, so the report can show it.
 *
 * Unique visitors: visitor_id = SHA-256(salt + UTC date + IP + UA), truncated. No cookie,
 * not reversible, and it changes every day, so it cannot track people across days.
 *
 * @see https://developers.cloudflare.com/workers/configuration/routing/routes/
 */
export interface Env {
  DB: D1Database;
  /** Full origin of the Pages host, e.g. https://kimber-sykes-site.pages.dev — no trailing slash */
  PAGES_ORIGIN: string;
  /** Secret salt for the daily visitor hash (wrangler secret put VISITOR_SALT). */
  VISITOR_SALT?: string;
}

import { AI_CRAWLER_BOT_NAMES } from "../../../lib/ai-crawlers";

const BOTS = AI_CRAWLER_BOT_NAMES;

type CfGeo = { country?: string; city?: string; region?: string };

const CANONICAL_HOST = "kimbersykes.com";
/** Visit https://kimbersykes.com/?ks_self=1 once per browser to exclude yourself. ?ks_self=0 undoes it. */
const SELF_COOKIE = "ks_self";

function detectBot(userAgent: string): string | null {
  if (!userAgent) return null;
  for (const { needle, name } of BOTS) {
    if (userAgent.includes(needle)) return name;
  }
  return null;
}

/** Non-browser or generic automated traffic not matched as a named AI bot. */
function isAutomatedUa(userAgent: string): boolean {
  if (!userAgent.trim()) return true;
  if (!userAgent.startsWith("Mozilla/")) return true;
  return /bot|crawl|spider|slurp|preview|scan|monitor|uptime|check|fetch|facebookexternalhit|wget|curl|python|java\/|go-http|okhttp|axios|node-fetch|undici|libwww|httpclient|headless|phantom|puppeteer|playwright|selenium|semrush|ahrefs|petalbot|dotbot|mj12|zgrab|masscan|nuclei|censys|bytespider/i.test(
    userAgent,
  );
}

/** Paths that are never a real page on this site (scanner probes, dotfiles, API, server scripts). */
function isProbePath(p: string): boolean {
  const lower = p.toLowerCase();
  if (lower.startsWith("/api/")) return true;
  if (/(^|\/)\./.test(lower)) return true; // any dotfile or dot-dir: /.env, /.git/config, /app/.env
  if (/\.(php\d?|asp|aspx|jsp|cgi|env|ini|sql|bak|old|save|zip|tar|gz|rar|7z|log|yml|yaml|conf|config)$/i.test(lower)) return true;
  if (/^\/(wp-|wordpress|xmlrpc|cgi-bin|phpmyadmin|pma|admin|administrator|vendor|actuator|server-status|owa|autodiscover|boaform|hnap1)/.test(lower)) return true;
  return false;
}

function isStaticAsset(p: string): boolean {
  if (p.startsWith("/_next/")) return true;
  if (p.startsWith("/images/")) return true;
  if (p === "/favicon.svg" || p.endsWith(".ico")) return true;
  return /\.(jpg|jpeg|png|gif|webp|avif|svg|css|js|mjs|map|woff2?|ttf|txt|xml|json|pdf|webmanifest)$/i.test(p);
}

function hasCookie(request: Request, name: string, value: string): boolean {
  const raw = request.headers.get("Cookie") ?? "";
  return raw.split(/;\s*/).some((c) => c === `${name}=${value}`);
}

async function visitorId(salt: string, day: string, ip: string, ua: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}|${day}|${ip}|${ua}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type HumanDecision =
  | { log: true; browserConfirmed: boolean }
  | { log: false; reason: string | null }; // reason null = not a page request, don't record

/** Pre-response checks. Returns a filter reason, or null if it may be a human page view. */
function preCheck(request: Request, url: URL, ua: string): HumanDecision | null {
  if (request.method !== "GET") return { log: false, reason: null };
  const p = url.pathname;
  if (isStaticAsset(p)) return { log: false, reason: null };
  if (isProbePath(p)) return { log: false, reason: "probe_path" };
  if (hasCookie(request, SELF_COOKIE, "1") || url.searchParams.has(SELF_COOKIE)) {
    return { log: false, reason: "self" };
  }
  if (isAutomatedUa(ua)) return { log: false, reason: ua.trim() ? "automated_ua" : "no_ua" };
  const accept = request.headers.get("Accept") ?? "";
  if (!accept.includes("text/html")) return { log: false, reason: "not_html_accept" };
  const dest = request.headers.get("Sec-Fetch-Dest");
  if (dest && dest !== "document") return { log: false, reason: "not_document" };
  return null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === `www.${CANONICAL_HOST}`) {
      const apex = new URL(url.pathname + url.search, `https://${CANONICAL_HOST}`);
      return Response.redirect(apex.toString(), 301);
    }

    const ua = request.headers.get("User-Agent") ?? "";
    const bot = detectBot(ua);

    const pathWithQuery = url.pathname + url.search;
    const ts = new Date().toISOString();
    const cf = request.cf as CfGeo | undefined;
    const country = cf?.country ?? "";
    const city = cf?.city ?? "";
    const region = cf?.region ?? "";

    if (bot) {
      ctx.waitUntil(
        env.DB.prepare(
          "INSERT INTO crawler_visits (ts, bot_name, path, country) VALUES (?, ?, ?, ?)",
        )
          .bind(ts, bot, pathWithQuery, country)
          .run()
          .catch((e) => console.error("crawler-logger D1 insert failed:", e)),
      );
    }

    const base = (env.PAGES_ORIGIN.endsWith("/") ? env.PAGES_ORIGIN.slice(0, -1) : env.PAGES_ORIGIN);
    const pagesOrigin = new URL(base);
    const targetUrl = new URL(url.pathname + url.search, `${pagesOrigin.origin}/`);

    const outHeaders = new Headers();
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase() === "host") continue;
      outHeaders.set(key, value);
    }
    outHeaders.set("Host", pagesOrigin.host);

    let response = await fetch(
      new Request(targetUrl.toString(), {
        method: request.method,
        headers: outHeaders,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      }),
    );

    // Owner opt-out: ?ks_self=1 sets a 1-year cookie, ?ks_self=0 clears it.
    const selfParam = url.searchParams.get(SELF_COOKIE);
    if (selfParam === "1" || selfParam === "0") {
      response = new Response(response.body, response);
      response.headers.append(
        "Set-Cookie",
        `${SELF_COOKIE}=${selfParam === "1" ? "1" : ""}; Path=/; Max-Age=${selfParam === "1" ? 31536000 : 0}; Secure; SameSite=Lax`,
      );
    }

    if (bot) return response;

    let decision = preCheck(request, url, ua);
    if (!decision) {
      const type = response.headers.get("Content-Type") ?? "";
      if (response.status !== 200) decision = { log: false, reason: `status_${response.status}` };
      else if (!type.includes("text/html")) decision = { log: false, reason: null };
      else decision = { log: true, browserConfirmed: request.headers.get("Sec-Fetch-Dest") === "document" };
    }

    if (decision.log) {
      const browserConfirmed = decision.browserConfirmed ? 1 : 0;
      const ip = request.headers.get("CF-Connecting-IP") ?? "";
      ctx.waitUntil(
        visitorId(env.VISITOR_SALT ?? "", ts.slice(0, 10), ip, ua)
          .then((vid) =>
            env.DB.prepare(
              "INSERT INTO human_visits (ts, path, country, city, region, visitor_id, browser_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?)",
            )
              .bind(ts, pathWithQuery, country, city, region, vid, browserConfirmed)
              .run(),
          )
          .catch((e) => console.error("crawler-logger human_visits insert failed:", e)),
      );
    } else if (decision.reason) {
      const reason = decision.reason;
      ctx.waitUntil(
        env.DB.prepare("INSERT INTO filtered_visits (ts, reason) VALUES (?, ?)")
          .bind(ts, reason)
          .run()
          .catch((e) => console.error("crawler-logger filtered_visits insert failed:", e)),
      );
    }

    return response;
  },
};
