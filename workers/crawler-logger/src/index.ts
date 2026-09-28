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

type CfGeo = {
  country?: string;
  city?: string;
  region?: string;
  asn?: number;
  asOrganization?: string;
};

/**
 * Hosting / cloud networks. Traffic from these is a machine, not a person on a laptop.
 * A person on a commercial VPN can land here too; that is why the JavaScript beacon
 * below is the headline number and this is only a filter on the edge count.
 */
const DATACENTER_ASNS = new Set<number>([
  16509, 14618, 39111, 8987, // Amazon / AWS
  15169, 396982, 19527, // Google
  8075, 8068, 8069, 12076, // Microsoft / Azure
  16276, 35540, // OVH
  24940, 213230, 212317, // Hetzner
  14061, // DigitalOcean
  63949, 20473, // Akamai (Linode) / Vultr-Choopa
  45102, 37963, // Alibaba
  132203, 45090, // Tencent
  9009, 3223, // M247 / Voxility
  51167, 40021, // Contabo / NForce
  12876, // Scaleway
  60781, // LeaseWeb
  31898, // Oracle Cloud
  60068, 212238, // Datacamp / CDN77
  53667, 62904, 396507, // FranTech / Eonix
]);

const DATACENTER_ORG_RE =
  /(amazon|aws|google\s?(cloud|llc)|microsoft|azure|ovh|hetzner|digitalocean|linode|vultr|choopa|alibaba|tencent|huawei\s?cloud|oracle|scaleway|leaseweb|contabo|ionos|hostinger|godaddy|namecheap|bluehost|dreamhost|rackspace|equinix|digital\s?realty|colo|data\s?cent|datacent|hosting|host|vps|server[s]?|cloud|cdn|m247|zenlayer|psychz|quadranet|servermania|worldstream|serverius)/i;

function isDatacenterNetwork(cf: CfGeo | undefined): boolean {
  if (!cf) return false;
  if (typeof cf.asn === "number" && DATACENTER_ASNS.has(cf.asn)) return true;
  const org = cf.asOrganization ?? "";
  return org ? DATACENTER_ORG_RE.test(org) : false;
}

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
  | { log: false; reason: string | null; detail?: string }; // reason null = not a page request, don't record

/** Pre-response checks. Returns a filter reason, or null if it may be a human page view. */
function preCheck(request: Request, url: URL, ua: string, cf: CfGeo | undefined): HumanDecision | null {
  if (request.method !== "GET") return { log: false, reason: null };
  const p = url.pathname;
  if (isStaticAsset(p)) return { log: false, reason: null };
  if (isProbePath(p)) return { log: false, reason: "probe_path" };
  if (hasCookie(request, SELF_COOKIE, "1") || url.searchParams.has(SELF_COOKIE)) {
    return { log: false, reason: "self" };
  }
  if (isAutomatedUa(ua)) return { log: false, reason: ua.trim() ? "automated_ua" : "no_ua" };
  if (isDatacenterNetwork(cf)) return { log: false, reason: "datacenter", detail: cf?.asOrganization ?? String(cf?.asn ?? "") };
  const accept = request.headers.get("Accept") ?? "";
  if (!accept.includes("text/html")) return { log: false, reason: "not_html_accept" };
  const dest = request.headers.get("Sec-Fetch-Dest");
  if (dest && dest !== "document") return { log: false, reason: "not_document" };
  return null;
}


/**
 * Beacon: the page runs this after it renders, so only a browser that executes
 * JavaScript and actually shows the page is counted. Injected into every HTML
 * response below, so the site itself needs no change.
 *
 * It also hooks the History API (pushState / replaceState / popstate), because this
 * is a Next.js app: clicking a link swaps the page without a new document load, and
 * without this only the landing page would ever be counted. Repeats of the same path
 * within 2 seconds are ignored so one navigation cannot double-count.
 *
 * Active time: each view gets a random id and counts only seconds where the tab is
 * visible, the window has focus, and there was input in the last 15 seconds (so quiet reading counts), capped
 * at 30 minutes. The total is sent when the page is hidden, left or navigated away
 * from (and once a minute for long reads), and updates that view's row.
 */
const BEACON_PATH = "/api/pv";
const BEACON_SCRIPT = `<script>(function(){try{if(navigator.webdriver)return;var P="${BEACON_PATH}",IDLE=15e3,CAP=18e5,cur=null,active=false,last=0,idle=0;
function post(o){try{var b=JSON.stringify(o);if(navigator.sendBeacon){navigator.sendBeacon(P,new Blob([b],{type:"application/json"}))}else{fetch(P,{method:"POST",body:b,keepalive:true,headers:{"Content-Type":"application/json"}})}}catch(e){}}
function engaged(){return document.visibilityState==="visible"&&document.hasFocus()&&Date.now()-idle<IDLE}
function tick(){var n=Date.now();if(cur&&active){cur.ms+=n-last;if(cur.ms>CAP)cur.ms=CAP}last=n;active=engaged()}
function flush(final){if(!cur)return;tick();var ms=Math.round(cur.ms);if(ms>=1000&&ms!==cur.sent){cur.sent=ms;post({v:cur.id,t:ms})}if(final)cur=null}
function start(path){if(cur&&cur.path===path&&Date.now()-cur.at<2e3)return;flush(true);var id=Date.now().toString(36)+Math.random().toString(36).slice(2,10);cur={id:id,path:path,ms:0,at:Date.now()};idle=last=Date.now();active=engaged();post({p:path,v:id})}
function later(){setTimeout(function(){if(document.visibilityState==="visible")start(location.pathname)},600)}
function wake(){idle=Date.now();tick()}
["mousemove","keydown","scroll","click","touchstart","wheel"].forEach(function(e){addEventListener(e,wake,{passive:true})});
addEventListener("focus",wake);addEventListener("blur",tick);
addEventListener("visibilitychange",function(){tick();if(document.visibilityState==="visible"){wake();if(!cur)later()}else{flush(false)}});
addEventListener("pagehide",function(){flush(true)});
setInterval(tick,1e3);setInterval(function(){flush(false)},6e4);
["pushState","replaceState"].forEach(function(m){var o=history[m];history[m]=function(){var r=o.apply(this,arguments);later();return r}});
addEventListener("popstate",later);addEventListener("hashchange",later);
if(document.visibilityState==="visible")later()}catch(e){}})();</script>`;

class BeaconInjector {
  element(el: Element) {
    el.append(BEACON_SCRIPT, { html: true });
  }
}

async function handleBeacon(
  request: Request,
  url: URL,
  env: Env,
  ctx: ExecutionContext,
  cf: CfGeo | undefined,
  ua: string,
): Promise<Response> {
  const noContent = new Response(null, { status: 204 });
  if (request.method !== "POST") return new Response("Not found", { status: 404 });

  // Only accept a beacon the site itself sent, from a browser we would have counted anyway.
  const site = request.headers.get("Sec-Fetch-Site");
  if (site && site !== "same-origin") return noContent;
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).hostname !== url.hostname) return noContent;
  if (hasCookie(request, SELF_COOKIE, "1")) return noContent;
  if (isAutomatedUa(ua) || detectBot(ua) || isDatacenterNetwork(cf)) return noContent;

  let body: { p?: unknown; v?: unknown; t?: unknown };
  try {
    body = (await request.json()) as { p?: unknown; v?: unknown; t?: unknown };
  } catch {
    return noContent;
  }

  const viewId =
    typeof body.v === "string" && /^[a-z0-9]{8,32}$/.test(body.v) ? body.v : null;
  if (!viewId) return noContent;

  // Active-time update for a view already logged.
  if (typeof body.t === "number" && Number.isFinite(body.t)) {
    const activeMs = Math.min(Math.max(Math.round(body.t), 0), 1_800_000);
    ctx.waitUntil(
      env.DB.prepare(
        "UPDATE beacon_views SET active_ms = ? WHERE view_id = ? AND COALESCE(active_ms, 0) < ?",
      )
        .bind(activeMs, viewId, activeMs)
        .run()
        .catch((e) => console.error("crawler-logger beacon update failed:", e)),
    );
    return noContent;
  }

  let path = "/";
  if (typeof body.p === "string" && body.p.startsWith("/")) path = body.p.slice(0, 200);
  else return noContent;
  if (isProbePath(path) || isStaticAsset(path)) return noContent;

  const ts = new Date().toISOString();
  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  ctx.waitUntil(
    visitorId(env.VISITOR_SALT ?? "", ts.slice(0, 10), ip, ua)
      .then((vid) =>
        env.DB.prepare(
          "INSERT INTO beacon_views (ts, path, country, city, region, visitor_id, view_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
          .bind(ts, path, cf?.country ?? "", cf?.city ?? "", cf?.region ?? "", vid, viewId)
          .run(),
      )
      .catch((e) => console.error("crawler-logger beacon insert failed:", e)),
  );
  return noContent;
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

    if (url.pathname === BEACON_PATH) {
      return handleBeacon(request, url, env, ctx, request.cf as unknown as CfGeo | undefined, ua);
    }

    const pathWithQuery = url.pathname + url.search;
    const ts = new Date().toISOString();
    const cf = request.cf as unknown as CfGeo | undefined;
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

    if ((response.headers.get("Content-Type") ?? "").includes("text/html") && response.status === 200) {
      response = new HTMLRewriter().on("body", new BeaconInjector()).transform(response);
    }

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

    let decision = preCheck(request, url, ua, cf);
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
      const detail = (decision.detail ?? "").slice(0, 80);
      ctx.waitUntil(
        env.DB.prepare("INSERT INTO filtered_visits (ts, reason, detail) VALUES (?, ?, ?)")
          .bind(ts, reason, detail)
          .run()
          .catch((e) => console.error("crawler-logger filtered_visits insert failed:", e)),
      );
    }

    return response;
  },
};
