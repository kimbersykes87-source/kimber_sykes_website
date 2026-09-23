"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

export function WorkProjectList({ projects }: { projects: Project[] }) {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const visible = useMemo(() => {
    if (!q) return projects;
    return projects.filter((p) => {
      const haystack = [p.client, p.project, p.role, p.agency, p.location, p.sector, p.body]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, q]);

  return (
    <>
      {q ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]" role="status">
          {visible.length === 0
            ? `No projects match “${searchParams.get("q")}”.`
            : `${visible.length} project${visible.length === 1 ? "" : "s"} matching “${searchParams.get("q")}”.`}
        </p>
      ) : null}
      <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </>
  );
}
