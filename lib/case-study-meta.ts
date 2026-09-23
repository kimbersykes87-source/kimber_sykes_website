import type { Project } from "@/lib/types";

/** Browser tab title: project name once, role, site name once. */
export function caseStudyPageTitle(project: Project): string {
  return `${project.project}, ${project.role} | Kimber Sykes`;
}
