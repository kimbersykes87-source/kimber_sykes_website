import type { Metadata } from "next";
import Link from "next/link";
import { LogoMarquee } from "@/components/LogoMarquee";
import { ProjectCard, ProjectCardCaption } from "@/components/ProjectCard";
import { Container, Section } from "@/components/layout";
import { getFeaturedProjects, mapCountries } from "@/lib/data";
import { MARQUEE_CLIENT_IDS } from "@/lib/marquee";
import { HOME_DESCRIPTION, HOME_TITLE, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
});

const stats = [
  { value: "23", label: "Years Experience" },
  { value: String(MARQUEE_CLIENT_IDS.length), label: "Global Brands" },
  { value: String(mapCountries.length), label: "Countries" },
];

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <Section className="pb-12 pt-8 sm:pb-16 sm:pt-12">
        <Container>
          <h1 className="font-display max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Freelance
          </h1>
          <p
            className="font-display mt-4 max-w-4xl text-balance text-3xl font-bold leading-tight tracking-tight text-[var(--color-muted)] sm:text-4xl lg:text-5xl"
            aria-hidden="true"
          >
            <span className="block">Producer.</span>
            <span className="block">Production.</span>
            <span className="block">Technical.</span>
          </p>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-muted)] sm:text-xl">
            Events professional specialising in large-scale event production, experiential event delivery and creative
            design across the UK, Europe, Middle East, Asia-Pacific and the US. Widely networked worldwide and known for
            strategic, hands-on leadership.
          </p>
          <Link
            href="/work"
            className="mt-10 inline-flex rounded-md bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            See What
          </Link>
        </Container>
      </Section>

      <div className="border-y border-white/10 bg-black/20 py-10">
        <Container>
          <h2 className="sr-only">By the numbers</h2>
          <ul className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <li key={s.label}>
                <p className="font-display text-3xl font-bold text-[var(--color-accent)] sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{s.label}</p>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <section className="border-b border-white/10 bg-black/25" aria-labelledby="home-brands-heading">
        <Container className="pb-4 pt-10 sm:pt-12">
          <h2 id="home-brands-heading" className="font-display text-xl font-semibold sm:text-2xl">
            Brands
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
            Technology, entertainment, financial services, automotive, and sport.
          </p>
        </Container>
        <LogoMarquee strip />
      </section>

      <Section>
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Featured work</h2>
              <p className="mt-1 text-[var(--color-muted)]">
                Four recent highlights. See the full gallery for the complete portfolio.
              </p>
            </div>
            <Link href="/work" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              View all work
            </Link>
          </div>
          <ul className="grid gap-8 sm:grid-cols-2">
            {featured.map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} showCaption={false} />
                <ProjectCardCaption project={p} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="border-t border-white/10 bg-black/20" aria-labelledby="hire-heading">
        <Container className="max-w-3xl">
          <h2 id="hire-heading" className="font-display text-2xl font-bold sm:text-3xl">
            About
          </h2>
          <div className="mt-6 space-y-4 text-[var(--color-muted)] leading-relaxed">
            <p>
              Kimber Sykes is a freelance Executive Producer, Production Manager, and Technical Director with 23 years
              leading large-scale corporate conferences, summits, product launches, and experiential brand activations.
            </p>
            <p>
              Services include executive production and project leadership, on-site production management, technical
              direction, vendor sourcing, and budget oversight for seven-figure programmes.
            </p>
            <p>
              Based in London and available for contract work across Europe and globally. Contact via{" "}
              <Link href="/contact" className="text-[var(--color-accent)] hover:underline">
                email or phone
              </Link>
              .
            </p>
          </div>
        </Container>
      </Section>

      <Section className="py-12">
        <Container>
          <p className="text-center text-lg text-[var(--color-muted)]">
            Available for freelance contracts worldwide. Based in London.
          </p>
        </Container>
      </Section>
    </>
  );
}
