import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/layout";
import { excerptFirstSentence, splitBodyParagraphs } from "@/lib/body";
import { getAdjacentProjects, getProjectBySlug, projects } from "@/lib/data";
import { getProjectGalleryFromPublic } from "@/lib/gallery";
import { caseStudyPageTitle } from "@/lib/case-study-meta";
import { buildPageMetadata } from "@/lib/seo";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProjectBySlug(slug);
  if (!p) return {};
  const title = caseStudyPageTitle(p);
  const description = excerptFirstSentence(p.body);
  return buildPageMetadata({
    title,
    description,
    path: `/work/${p.slug}`,
    ogType: "article",
    ogImage: p.heroImage,
  });
}

function projectHeroAlt(project: { client: string; project: string; role: string; location: string }): string {
  return `${project.client} ${project.project} — ${project.role} at ${project.location}`;
}

function projectGalleryAlt(
  project: { client: string; project: string },
  index: number,
  total: number,
): string {
  return `${project.client} ${project.project} — event photograph ${index + 1} of ${total}`;
}

export default async function ProjectPage(props: Props) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { prev, next } = getAdjacentProjects(slug);
  const paras = splitBodyParagraphs(project.body);
  const gallery = (await getProjectGalleryFromPublic(project.slug)) ?? project.gallery;
  const heroAlt = projectHeroAlt(project);

  return (
    <>
      <article>
        <div className="relative aspect-[21/9] max-h-[70vh] w-full bg-neutral-900 sm:aspect-[21/9]">
          <Image
            src={project.heroImage}
            alt={heroAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <Section className="pt-10">
          <Container>
            <header className="max-w-3xl">
              <p className="text-sm font-medium text-[var(--color-accent)]">{project.client}</p>
              <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">{project.project}</h1>
              <dl className="mt-8 grid gap-3 sm:grid-cols-2 border-t border-white/10 pt-8 text-sm">
                <div>
                  <dt className="text-[var(--color-muted)]">Role</dt>
                  <dd className="mt-1 font-medium">{project.role}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Agency</dt>
                  <dd className="mt-1 font-medium">{project.agency}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Client</dt>
                  <dd className="mt-1 font-medium">{project.client}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Year</dt>
                  <dd className="mt-1 font-medium">{project.year}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[var(--color-muted)]">Location</dt>
                  <dd className="mt-1 font-medium">{project.location}</dd>
                </div>
              </dl>
            </header>

            <div className="prose prose-invert mt-12 max-w-3xl space-y-4 text-[var(--color-foreground)]">
              {paras.map((para, i) => (
                <p key={i} className="leading-relaxed text-[var(--color-muted)]">
                  {para}
                </p>
              ))}
            </div>

            {gallery.length > 0 ? (
              <div className="mt-16">
                <h2 className="font-display text-xl font-semibold">Gallery</h2>
                <ul className="mt-6 columns-1 gap-4 sm:columns-2">
                  {gallery.map((src, i) => (
                    <li key={src} className="mb-4 break-inside-avoid">
                      <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-neutral-900">
                        <Image
                          src={src}
                          alt={projectGalleryAlt(project, i, gallery.length)}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          loading="lazy"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <nav
              aria-label="Adjacent projects"
              className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:justify-between"
            >
              {prev ? (
                <Link
                  href={`/work/${prev.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  <span>Previous: {prev.client}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/work/${next.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline sm:ml-auto"
                >
                  <span>Next: {next.client}</span>
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              ) : null}
            </nav>
          </Container>
        </Section>
      </article>
    </>
  );
}
