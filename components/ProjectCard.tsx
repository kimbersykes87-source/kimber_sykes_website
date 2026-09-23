import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

type Props = {
  project: Project;
  className?: string;
  showCaption?: boolean;
};

function cardAriaLabel(project: Project): string {
  return `${project.project}. ${project.client}. ${project.role}. ${project.agency}. ${project.year}`;
}

export function ProjectCard({ project, className = "", showCaption = true }: Props) {
  return (
    <div className={className}>
      <Link
        href={`/work/${project.slug}`}
        aria-label={cardAriaLabel(project)}
        className="group relative block overflow-hidden rounded-lg bg-neutral-900 ring-1 ring-white/10 transition hover:ring-white/20"
      >
        <div className="relative aspect-[16/9] w-full bg-neutral-900">
          <Image
            src={project.heroImage}
            alt={`${project.client}: ${project.project}`}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width:1200px) 50vw, 33vw"
          />
          <div
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/85 via-black/25 to-transparent md:block"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 hidden p-4 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 md:block">
            <p className="font-medium text-white">{project.project}</p>
            <p className="text-sm text-white/90">{project.client}</p>
            <p className="text-xs text-white/75">
              {project.role} · {project.agency} · {project.year}
            </p>
          </div>
        </div>
      </Link>
      {showCaption ? (
        <div className="mt-3 md:hidden">
          <ProjectCardCaption project={project} />
        </div>
      ) : null}
    </div>
  );
}

export function ProjectCardCaption({ project }: { project: Project }) {
  return (
    <div className="mt-3">
      <p className="font-medium">{project.project}</p>
      <p className="text-sm text-[var(--color-muted)]">
        {project.client} · {project.role} · {project.agency} · {project.year}
      </p>
    </div>
  );
}
