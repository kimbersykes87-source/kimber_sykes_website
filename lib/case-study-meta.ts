import { excerptFirstSentence } from "@/lib/body";
import type { Project } from "@/lib/types";

/** Browser tab title: project name once, role credit exactly as written, site name once. */
export function caseStudyPageTitle(project: Project): string {
  return `${project.project}, ${project.role} | Kimber Sykes`;
}

/** "Client Project", without repeating the client when the project name already contains it. */
export function clientAndProject(project: Project): string {
  return project.project.toLowerCase().includes(project.client.toLowerCase())
    ? project.project
    : `${project.client} ${project.project}`;
}

/** Hero image alt: what, for whom, where and when. */
export function caseStudyHeroAlt(project: Project): string {
  return `${clientAndProject(project)} in ${project.location}, ${project.year}`;
}

/**
 * Meta description that always names Kimber, the credit and the facts buyers scan for,
 * followed by as much of the opening sentence as fits in ~160 characters.
 */
export function caseStudyDescription(project: Project): string {
  if (project.summary && project.summary.length <= 160) return project.summary;
  const lead = `${project.project} for ${project.client}, ${project.location}, ${project.year}. Kimber Sykes: ${project.role}.`;
  const first = excerptFirstSentence(project.body);
  const full = `${lead} ${first}`;
  if (full.length <= 160) return full;
  const room = 157 - lead.length - 1;
  if (room < 40) return lead;
  const cut = first.slice(0, room).replace(/\s+\S*$/, "").replace(/[,;:]$/, "");
  return `${lead} ${cut}...`;
}
