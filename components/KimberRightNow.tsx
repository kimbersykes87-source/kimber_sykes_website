"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ApiResponse = {
  state: string | null;
  country: string | null;
  countryCode: string | null;
  tsUtc: string;
  tsLocal: string | null;
  timeZone: string | null;
};

type Status = {
  loading: boolean;
  error: string | null;
  data: ApiResponse | null;
};

const WORKING_START_HOUR = 7;
const WORKING_END_HOUR = 19;
const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // refresh location hourly while panel is open
const TICK_INTERVAL_MS = 30 * 1000;

/**
 * Parse the trailing UTC offset on an ISO 8601 string like
 * "2026-01-01T12:34:56+08:00" / "...-05:30" / "...Z".
 * Android may append an IANA zone suffix like "[America/Vancouver]".
 * Returns offset in minutes from UTC, or null if not parseable.
 */
function parseOffsetMinutes(iso: string | null): number | null {
  if (!iso) return null;
  const normalized = iso.trim().replace(/\[[^\]]+\]$/, "");
  if (normalized.endsWith("Z")) return 0;
  const m = normalized.match(/([+-])(\d{2}):?(\d{2})$/);
  if (!m) return null;
  const sign = m[1] === "+" ? 1 : -1;
  const hours = Number(m[2]);
  const minutes = Number(m[3]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return sign * (hours * 60 + minutes);
}

/**
 * Returns a Date whose UTC components reflect the wall-clock time at the
 * given UTC offset. Use getUTCHours/getUTCMinutes/getUTCDay to read them.
 */
function shiftToOffset(date: Date, offsetMinutes: number): Date {
  return new Date(date.getTime() + offsetMinutes * 60_000);
}

const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

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

function resolveKimberTimeZone(
  timeZone: string | null,
  countryCode: string | null,
): string | null {
  if (timeZone) return timeZone;
  if (!countryCode) return null;
  return TIMEZONE_BY_COUNTRY[countryCode.toUpperCase()] ?? null;
}

function getKimberWallClock(
  now: Date,
  timeZone: string | null,
  tsLocal: string | null,
): { hour: number; minute: number; day: number; timeText: string } {
  if (timeZone) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
      hour12: false,
    }).formatToParts(now);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
    const day = WEEKDAY_SHORT_TO_INDEX[wd] ?? 0;
    const timeText = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
    return { hour, minute, day, timeText };
  }

  const offsetMinutes = parseOffsetMinutes(tsLocal) ?? 0;
  const shifted = shiftToOffset(now, offsetMinutes);
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  const day = shifted.getUTCDay();
  return { hour, minute, day, timeText: format12Hour(hour, minute) };
}

function isWorkingHours(hour: number, day: number): boolean {
  const isWeekday = day >= 1 && day <= 5; // Mon–Fri
  return isWeekday && hour >= WORKING_START_HOUR && hour <= WORKING_END_HOUR;
}

function format12Hour(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  let h = hour % 12;
  if (h === 0) h = 12;
  const mm = minute.toString().padStart(2, "0");
  return `${h}:${mm} ${period}`;
}

export function KimberRightNow() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ loading: true, error: null, data: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let abort = new AbortController();

    async function load() {
      abort.abort();
      abort = new AbortController();
      try {
        const res = await fetch("/api/kimber-now", {
          signal: abort.signal,
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as ApiResponse;
        if (!cancelled) setStatus({ loading: false, error: null, data });
      } catch (err) {
        if (cancelled || (err as Error).name === "AbortError") return;
        setStatus({
          loading: false,
          error: (err as Error).message || "Failed to load",
          data: null,
        });
      }
    }

    load();
    const refresh = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      abort.abort();
      window.clearInterval(refresh);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const id = window.setInterval(() => setTick((t) => t + 1), TICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [open]);

  const view = useMemo(() => {
    const now = new Date();
    void tick; // re-compute on tick

    // Visitor (browser) wall-clock
    const visitorHour = now.getHours();
    const visitorMinute = now.getMinutes();
    const visitorDay = now.getDay();
    const visitorOnline = isWorkingHours(visitorHour, visitorDay);
    const visitorTimeText = format12Hour(visitorHour, visitorMinute);

    if (!status.data) {
      return {
        ready: false as const,
        visitorTimeText,
        visitorOnline,
      };
    }

    const { tsLocal, timeZone, countryCode, state, country } = status.data;
    const kimberZone = resolveKimberTimeZone(timeZone, countryCode);
    const { hour: kHour, day: kDay, timeText: kimberTimeText } = getKimberWallClock(
      now,
      kimberZone,
      tsLocal,
    );

    const kimberOnline = isWorkingHours(kHour, kDay);

    const placeParts: string[] = [];
    if (state) placeParts.push(state);
    if (country) placeParts.push(country);
    const place = placeParts.length > 0 ? placeParts.join(", ") : "an unknown location";

    const bothOnline = kimberOnline && visitorOnline;

    return {
      ready: true as const,
      place,
      kimberTimeText,
      kimberOnline,
      visitorTimeText,
      visitorOnline,
      bothOnline,
    };
  }, [status.data, tick]);

  return (
    <div className="rounded-lg border border-white/10 bg-black/40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="kimber-right-now-panel"
        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
        onClick={() => setOpen((value) => !value)}
      >
        <h2 className="font-display text-lg font-semibold sm:text-xl">
          Where is Kimber Right Now?
        </h2>
        <ChevronDown
          className={[
            "size-5 shrink-0 text-[var(--color-muted)] transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {open ? (
        <div id="kimber-right-now-panel" className="px-5 pb-5 sm:px-6 sm:pb-6">
          {status.loading && !status.data ? (
            <p className="text-sm text-[var(--color-muted)]">Locating&hellip;</p>
          ) : status.error && !status.data ? (
            <p className="text-sm text-[var(--color-muted)]">
              Live location is unavailable right now.
            </p>
          ) : view.ready ? (
            <>
              <p className="text-base sm:text-lg">
                Kimber is currently in{" "}
                <span className="font-medium text-[var(--color-foreground)]">{view.place}</span>{" "}
                and it is currently{" "}
                <span className="font-medium text-[var(--color-foreground)]">
                  {view.kimberTimeText}
                </span>
                .
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <StatusRow
                  label="Kimber"
                  meta={view.kimberTimeText}
                  online={view.kimberOnline}
                />
                <StatusRow
                  label="You"
                  meta={view.visitorTimeText}
                  online={view.visitorOnline}
                />
                <p
                  className={
                    view.bothOnline
                      ? "pt-1 text-[var(--color-accent)]"
                      : "pt-1 text-[var(--color-muted)]"
                  }
                >
                  {view.bothOnline
                    ? "We are both online — good time to chat."
                    : view.kimberOnline
                      ? "Kimber is within working hours but you are outside yours."
                      : view.visitorOnline
                        ? "You are within working hours but Kimber is outside hers."
                        : "Neither of us is currently within working hours."}
                </p>
              </div>

            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StatusRow({
  label,
  meta,
  online,
}: {
  label: string;
  meta: string;
  online: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className={[
          "inline-block size-2.5 rounded-full",
          online ? "bg-emerald-400" : "bg-white/30",
        ].join(" ")}
      />
      <span className="font-medium text-[var(--color-foreground)]">{label}</span>
      <span className="text-[var(--color-muted)]">{meta}</span>
      <span className={online ? "text-emerald-400" : "text-[var(--color-muted)]"}>
        {online ? "online" : "offline"}
      </span>
    </div>
  );
}
