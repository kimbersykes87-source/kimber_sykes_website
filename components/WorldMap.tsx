"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import Image from "next/image";
import { X } from "lucide-react";
import type { MapCountry } from "@/lib/types";
import { getLogoEntryForClient } from "@/lib/clientLogo";
import { getDeliveryCitiesForMapCountry } from "@/lib/deliveryLocations";
import { atlasNameIsHighlighted, resolveCountriesForAtlasName } from "@/lib/mapGeo";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const fillDefault = "#1a1a1a";
const fillDefaultStroke = "#2d2d2d";
const fillHi = "#38bdf8";
const fillHover = "#7dd3fc";

type Props = {
  className?: string;
};

export function WorldMap({ className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [panelCountries, setPanelCountries] = useState<MapCountry[]>([]);

  const openPanel = useCallback((name: string) => {
    const rows = resolveCountriesForAtlasName(name);
    if (rows.length === 0) return;
    setPanelCountries(rows);
    setOpen(true);
  }, []);

  const closePanel = useCallback(() => setOpen(false), []);

  const title = useMemo(() => {
    if (panelCountries.length === 0) return "";
    if (panelCountries.length === 1) return panelCountries[0]!.country;
    return panelCountries.map((c) => c.country).join(" · ");
  }, [panelCountries]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="aspect-[2/1] min-h-[280px] w-full max-w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 sm:min-h-[360px] md:min-h-[420px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 110,
            center: [0, 35],
          }}
          className="size-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full max-h-[70vh]"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = String(geo.properties.name ?? "");
                const highlighted = atlasNameIsHighlighted(name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => highlighted && openPanel(name)}
                    onKeyDown={(e) => {
                      if (!highlighted) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openPanel(name);
                      }
                    }}
                    tabIndex={highlighted ? 0 : -1}
                    aria-label={highlighted ? `${name}, view projects` : name}
                    style={{
                      default: {
                        fill: highlighted ? fillHi : fillDefault,
                        stroke: fillDefaultStroke,
                        strokeWidth: 0.35,
                        outline: "none",
                        cursor: highlighted ? "pointer" : "default",
                        opacity: highlighted ? 0.92 : 0.85,
                      },
                      hover: {
                        fill: highlighted ? fillHover : fillDefault,
                        stroke: highlighted ? fillHover : fillDefaultStroke,
                        strokeWidth: 0.5,
                        outline: "none",
                        opacity: 1,
                      },
                      pressed: {
                        fill: highlighted ? fillHi : fillDefault,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <p className="mt-3 text-sm text-[var(--color-muted)]">
        Highlighted countries have on-site deliveries. Click a highlighted country for project details.
      </p>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm"
          role="presentation"
          onClick={closePanel}
        >
          <aside
            className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[var(--color-background)] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-panel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[var(--color-background)] px-5 py-4">
              <h2 id="map-panel-title" className="font-display pr-8 text-lg font-semibold">
                {title}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-md p-2 text-[var(--color-muted)] hover:bg-white/10 hover:text-[var(--color-foreground)]"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-5 py-6 space-y-10">
              {panelCountries.map((block) => {
                const cities = getDeliveryCitiesForMapCountry(block.country);
                return (
                <section key={block.countryCode}>
                  {panelCountries.length > 1 ? (
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      {block.country}
                    </h3>
                  ) : null}
                  {cities.length > 0 ? (
                    <p className="mt-4 text-sm text-[var(--color-muted)]">
                      Cities: {cities.join(", ")}
                    </p>
                  ) : null}
                  {block.projects.length === 0 ? (
                    <p className="mt-4 text-sm text-[var(--color-muted)]">
                      On-site project delivery{cities.length > 0 ? ` across ${cities.join(", ")}` : ""}.
                    </p>
                  ) : (
                  <ul className="mt-4 space-y-5">
                    {block.projects.map((row, i) => {
                      const logo = getLogoEntryForClient(row.client);
                      return (
                        <li
                          key={`${row.project}-${row.year}-${i}`}
                          className="flex gap-4 border-b border-white/5 pb-5 last:border-0"
                        >
                          <div className="relative mt-0.5 size-10 shrink-0 rounded bg-white/5">
                            {logo ? (
                              <Image
                                src={logo.file}
                                alt=""
                                fill
                                className="logo-on-dark object-contain p-1.5"
                              />
                            ) : (
                              <span className="flex size-full items-center justify-center text-xs text-[var(--color-muted)]">
                                {row.client.slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium leading-snug">{row.client}</p>
                            <p className="text-sm text-[var(--color-muted)]">{row.project}</p>
                            <p className="mt-1 text-xs text-[var(--color-muted)]">
                              {row.year != null ? `${row.agency} · ${row.year}` : row.agency}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  )}
                </section>
              );
              })}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
