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
import { deliveryLocations } from "@/lib/data";
import { CITY_COORDS } from "@/lib/cityCoords";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/*
 * Styled to match the "Delivered around the world" page of the Professional Portfolio PDF:
 * flat (equirectangular, vertically stretched) projection, no Antarctica, charcoal land,
 * muted navy for delivery countries and glowing cyan dots for each delivery city.
 */
const MAP_W = 1000;
const LAT_TOP = 84;
const LAT_BOTTOM = -57;
const Y_STRETCH = 1.234;
const PX_PER_DEG = MAP_W / 360;
const MAP_H = Math.round((LAT_TOP - LAT_BOTTOM) * PX_PER_DEG * Y_STRETCH);
const CENTER_LAT = (LAT_TOP + LAT_BOTTOM) / 2;

const fillDefault = "#1f1f1f";
const strokeDefault = "#0d0d0d";
const fillHi = "#253847";
const fillHover = "#31506a";
const dotColor = "#38bdf8";

/** delivery-locations.json country label → map.json country name */
const DELIVERY_TO_MAP_COUNTRY: Record<string, string> = {
  UK: "United Kingdom",
  UAE: "United Arab Emirates",
};

function projectPoint(lat: number, lng: number): [number, number] {
  return [
    MAP_W / 2 + lng * PX_PER_DEG,
    MAP_H / 2 - (lat - CENTER_LAT) * PX_PER_DEG * Y_STRETCH,
  ];
}

const cityDots = deliveryLocations.flatMap((row) =>
  row.cities.flatMap((city) => {
    const c = CITY_COORDS[city];
    if (!c) return [];
    const [x, y] = projectPoint(c[0], c[1]);
    return [{ city, country: DELIVERY_TO_MAP_COUNTRY[row.country] ?? row.country, x, y }];
  }),
);

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
      <div className="w-full max-w-full overflow-hidden">
        <ComposableMap
          projection="geoEquirectangular"
          width={MAP_W}
          height={MAP_H}
          projectionConfig={{
            scale: MAP_W / (2 * Math.PI),
            center: [0, CENTER_LAT],
          }}
          className="block h-auto w-full"
        >
          <g transform={`translate(0 ${MAP_H / 2}) scale(1 ${Y_STRETCH}) translate(0 ${-MAP_H / 2})`}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => String(geo.properties.name ?? "") !== "Antarctica")
                  .map((geo) => {
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
                            stroke: strokeDefault,
                            strokeWidth: 0.5,
                            vectorEffect: "non-scaling-stroke",
                            outline: "none",
                            cursor: highlighted ? "pointer" : "default",
                          },
                          hover: {
                            fill: highlighted ? fillHover : fillDefault,
                            stroke: strokeDefault,
                            strokeWidth: 0.5,
                            vectorEffect: "non-scaling-stroke",
                            outline: "none",
                            cursor: highlighted ? "pointer" : "default",
                          },
                          pressed: {
                            fill: highlighted ? fillHover : fillDefault,
                            stroke: strokeDefault,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
              }
            </Geographies>
          </g>
          <g aria-hidden="true">
            {cityDots.map((d) => (
              <g
                key={`${d.country}-${d.city}`}
                transform={`translate(${d.x} ${d.y})`}
                onClick={() => openPanel(d.country)}
                style={{ cursor: "pointer" }}
              >
                <title>{d.city}</title>
                <circle r={6} fill={dotColor} opacity={0.18} />
                <circle r={4} fill={dotColor} opacity={0.35} />
                <circle r={2.4} fill={dotColor} />
              </g>
            ))}
          </g>
        </ComposableMap>
      </div>

      <p className="mt-3 text-sm text-[var(--color-muted)]">
        Highlighted countries and city markers show on-site deliveries. Click a country or marker for project details.
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
