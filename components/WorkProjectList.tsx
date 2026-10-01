"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import siteData from "@/data/site.json";
import type { Project, Sector } from "@/lib/types";

const SECTOR_ORDER: Sector[] = ["B2B Tech", "Consumer", "Sports", "Other"];
const SECTOR_HEADINGS = siteData.sectors as Record<Sector, string>;

function sectorId(sector: Sector): string {
  return `sector-${sector.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

/** The first two cards are above the fold on phones (the LCP image), so they load eagerly with high priority. */
const PRIORITY_CARDS = 2;

function Grid({ items, priorityCount = 0 }: { items: Project[]; priorityCount?: number }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <li key={p.slug}>
          <ProjectCard project={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Server-rendered and grouped by sector. The optional `?q=` filter is read after hydration
 * (not via useSearchParams), so static export still ships the full list of links.
 */
export function WorkProjectList({ projects }: { projects: Project[] }) {
  const [rawQuery, setRawQuery] = useState("");

  useEffect(() => {
    setRawQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);

  const q = rawQuery.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!q) return projects;
    return projects.filter((p) =>
      [p.client, p.project, p.role, p.agency, p.location, p.sector, p.body].join(" ").toLowerCase().includes(q),
    );
  }, [projects, q]);

  if (q) {
    return (
      <>
        <p className="mt-4 text-sm text-[var(--color-muted)]" role="status">
          {visible.length === 0
            ? `No projects match “${rawQuery}”.`
            : `${visible.length} project${visible.length === 1 ? "" : "s"} matching “${rawQuery}”.`}
        </p>
        <Grid items={visible} priorityCount={PRIORITY_CARDS} />
      </>
    );
  }

  return (
    <>
      {SECTOR_ORDER.map((sector, sectorIndex) => {
        const items = projects.filter((p) => p.sector === sector);
        if (items.length === 0) return null;
        const id = sectorId(sector);
        return (
          <section key={sector} aria-labelledby={id} className="mt-14 first:mt-12">
            <h2 id={id} className="font-display text-xl font-semibold sm:text-2xl">
              {SECTOR_HEADINGS[sector]}
            </h2>
            <Grid items={items} priorityCount={sectorIndex === 0 ? PRIORITY_CARDS : 0} />
          </section>
        );
      })}
    </>
  );
}
