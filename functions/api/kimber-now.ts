/**
 * GET /api/kimber-now — Cloudflare Pages Function.
 *
 * Returns Kimber's most recent location (state + country) and the timestamp
 * for that fix, by proxying the GPS_Tracker Cloudflare Worker and
 * reverse-geocoding the latest point with OpenStreetMap Nominatim.
 *
 * Env vars (configure via Cloudflare Pages → Settings → Environment variables):
 *   - KIMBER_GPS_WORKER_URL  (default: https://gps-tracker.kimbersykes87.workers.dev)
 *   - KIMBER_GPS_USER_ID     (default: device_26a4f9dd)
 *   - KIMBER_GPS_API_KEY     (optional; only if the Worker requires X-API-Key)
 */

interface Env {
  KIMBER_GPS_WORKER_URL?: string;
  KIMBER_GPS_USER_ID?: string;
  KIMBER_GPS_API_KEY?: string;
}

interface PagesFunctionContext {
  request: Request;
  env: Env;
}

interface PointRow {
  lat: number;
  lon: number;
  ts_utc: string;
  ts_local?: string | null;
}

interface DaysResponse {
  days?: string[];
}

interface NominatimAddress {
  state?: string;
  region?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  country?: string;
  country_code?: string;
}

const DEFAULT_WORKER_URL = "https://gps-tracker.kimbersykes87.workers.dev";
const DEFAULT_USER_ID = "device_26a4f9dd";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_UA =
  "kimbersykes.com /where-right-now (contact: hello@kimbersykes.com)";

function jsonResponse(body: unknown, status: number, cacheSeconds = 0): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
  };
  if (cacheSeconds > 0) {
    headers["Cache-Control"] = `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`;
  } else {
    headers["Cache-Control"] = "no-store";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function fetchPoints(
  workerUrl: string,
  userId: string,
  headers: Record<string, string>,
  startDate: string,
  endDate: string,
): Promise<{ points: PointRow[]; error?: Response }> {
  const pointsUrl = new URL(`${workerUrl}/api/points`);
  pointsUrl.searchParams.set("user_id", userId);
  pointsUrl.searchParams.set("start_date", startDate);
  pointsUrl.searchParams.set("end_date", endDate);

  let pointsRes: Response;
  try {
    pointsRes = await fetch(pointsUrl.toString(), {
      headers,
      // Cloudflare-specific cache hint; ignored elsewhere.
      cf: { cacheTtl: 60, cacheEverything: true },
    } as RequestInit);
  } catch {
    return { points: [], error: jsonResponse({ error: "Failed to reach GPS worker" }, 502) };
  }

  if (!pointsRes.ok) {
    return { points: [], error: jsonResponse({ error: `GPS worker error ${pointsRes.status}` }, 502) };
  }

  try {
    const pointsBody = (await pointsRes.json()) as { points?: PointRow[] };
    return { points: pointsBody.points ?? [] };
  } catch {
    return { points: [], error: jsonResponse({ error: "Invalid GPS worker response" }, 502) };
  }
}

/** IANA zone from Android ts_local suffix, e.g. "...+02:00[Europe/Madrid]" */
function parseIanaFromTsLocal(tsLocal: string | null | undefined): string | null {
  if (!tsLocal) return null;
  const m = tsLocal.trim().match(/\[([^\]]+)\]$/);
  return m?.[1] ?? null;
}

/** Fallback when coordinate lookup fails; covers common project countries only. */
const TIMEZONE_BY_COUNTRY: Record<string, string> = {
  ES: "Europe/Madrid",
  GB: "Europe/London",
  UK: "Europe/London",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  IT: "Europe/Rome",
  PT: "Europe/Lisbon",
  NL: "Europe/Amsterdam",
  BE: "Europe/Brussels",
  CH: "Europe/Zurich",
  AT: "Europe/Vienna",
  IE: "Europe/Dublin",
  US: "America/New_York",
  AE: "Asia/Dubai",
  AU: "Australia/Sydney",
  SG: "Asia/Singapore",
  JP: "Asia/Tokyo",
  CA: "America/Toronto",
};

function timeZoneFromCountryCode(countryCode: string | null): string | null {
  if (!countryCode) return null;
  return TIMEZONE_BY_COUNTRY[countryCode.toUpperCase()] ?? null;
}

async function fetchTimeZoneFromCoordinates(lat: number, lon: number): Promise<string | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("timezone", "auto");

  try {
    const res = await fetch(url.toString(), {
      cf: { cacheTtl: 86_400, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return null;
    const body = (await res.json()) as { timezone?: string };
    const tz = body.timezone;
    return tz && tz !== "GMT" ? tz : null;
  } catch {
    return null;
  }
}

async function fetchLatestAvailableDay(
  workerUrl: string,
  userId: string,
  headers: Record<string, string>,
): Promise<string | null> {
  const daysUrl = new URL(`${workerUrl}/api/days`);
  daysUrl.searchParams.set("user_id", userId);

  try {
    const daysRes = await fetch(daysUrl.toString(), {
      headers,
      cf: { cacheTtl: 300, cacheEverything: true },
    } as RequestInit);
    if (!daysRes.ok) return null;
    const body = (await daysRes.json()) as DaysResponse;
    const days = body.days ?? [];
    return days.length > 0 ? days[days.length - 1]! : null;
  } catch {
    return null;
  }
}

export const onRequestGet = async ({ env }: PagesFunctionContext): Promise<Response> => {
  const workerUrl = (env.KIMBER_GPS_WORKER_URL ?? DEFAULT_WORKER_URL).replace(/\/$/, "");
  const userId = env.KIMBER_GPS_USER_ID ?? DEFAULT_USER_ID;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (env.KIMBER_GPS_API_KEY) headers["X-API-Key"] = env.KIMBER_GPS_API_KEY;

  const latestDay = await fetchLatestAvailableDay(workerUrl, userId, headers);
  if (!latestDay) {
    return jsonResponse({ error: "No GPS days available" }, 404);
  }

  let { points, error } = await fetchPoints(
    workerUrl,
    userId,
    headers,
    latestDay,
    latestDay,
  );
  if (error) return error;

  if (points.length === 0) {
    return jsonResponse({ error: "No GPS points available for latest day" }, 404);
  }

  let latest = points[0]!;
  for (const p of points) {
    if (p.ts_utc > latest.ts_utc) latest = p;
  }

  let state: string | null = null;
  let country: string | null = null;
  let countryCode: string | null = null;

  const geoUrl = new URL(NOMINATIM_BASE);
  geoUrl.searchParams.set("format", "jsonv2");
  geoUrl.searchParams.set("lat", String(latest.lat));
  geoUrl.searchParams.set("lon", String(latest.lon));
  geoUrl.searchParams.set("zoom", "8");
  geoUrl.searchParams.set("addressdetails", "1");

  try {
    const geoRes = await fetch(geoUrl.toString(), {
      headers: {
        "User-Agent": NOMINATIM_UA,
        Accept: "application/json",
      },
      // Cache geocode for 6h to stay well within Nominatim's usage policy.
      cf: { cacheTtl: 21_600, cacheEverything: true },
    } as RequestInit);
    if (geoRes.ok) {
      const geo = (await geoRes.json()) as { address?: NominatimAddress };
      const a = geo.address ?? {};
      state =
        a.state ?? a.region ?? a.county ?? a.city ?? a.town ?? a.village ?? null;
      country = a.country ?? null;
      countryCode = a.country_code ? a.country_code.toUpperCase() : null;
    }
  } catch {
    // Soft fail; we still return time.
  }

  const timeZone =
    parseIanaFromTsLocal(latest.ts_local) ??
    (await fetchTimeZoneFromCoordinates(latest.lat, latest.lon)) ??
    timeZoneFromCountryCode(countryCode);

  return jsonResponse(
    {
      state,
      country,
      countryCode,
      tsUtc: latest.ts_utc,
      tsLocal: latest.ts_local ?? null,
      timeZone,
    },
    200,
    60,
  );
};
