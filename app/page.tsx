import type { Metadata } from "next";
import Link from "next/link";
import { LogoMarquee } from "@/components/LogoMarquee";
import { ProjectCard, ProjectCardCaption } from "@/components/ProjectCard";
import { Container, Section } from "@/components/layout";
import { getFeaturedProjects, mapCountries } from "@/lib/data";
import { CLIENT_COUNT } from "@/lib/marquee";
import { IDENTITY } from "@/lib/identity";
import { HOME_DESCRIPTION, HOME_TITLE, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
});

const stats = [
  { value: String(IDENTITY.yearsExperience), label: "Years Experience" },
  { value: String(CLIENT_COUNT), label: "Clients" },
  { value: String(mapCountries.length), label: "Countries" },
];

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <Section className="relative isolate overflow-hidden pb-12 pt-8 sm:pb-16 sm:pt-12">
        {/* Decorative hero image: sits behind the text, full-bleed to the right edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[65%] opacity-50 [mask-image:linear-gradient(to_right,transparent_0%,black_45%),linear-gradient(to_bottom,transparent_0%,black_12%,black_85%,transparent_100%)] [mask-composite:intersect] sm:opacity-60 lg:w-[62%] lg:opacity-100 lg:[mask-image:linear-gradient(to_right,transparent_0%,black_30%),linear-gradient(to_bottom,transparent_0%,black_10%,black_88%,transparent_100%)]"
        >
          <picture>
            <source
              type="image/webp"
              srcSet="/images/home/ks_home-1200.webp 1200w, /images/home/ks_home.webp 2400w"
              sizes="(min-width: 1024px) 62vw, 65vw"
            />
            <img
              src="/images/home/ks_home.jpg"
              srcSet="/images/home/ks_home-1200.jpg 1200w, /images/home/ks_home.jpg 2400w"
              sizes="(min-width: 1024px) 62vw, 65vw"
              alt=""
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-[27%_50%] sm:object-left lg:object-center"
            />
          </picture>
        </div>
        <Container>
          {/* One heading, same look as before: the role lines are part of the H1 (not aria-hidden). */}
          <h1 className="font-display max-w-4xl text-balance font-bold leading-tight tracking-tight">
            <span className="block text-4xl sm:text-5xl lg:text-6xl">Freelance</span>{" "}
            <span className="mt-4 block text-3xl text-[var(--color-muted)] sm:text-4xl lg:text-5xl">
              <span className="block">Producer.</span>{" "}
              <span className="block">Production.</span>{" "}
              <span className="block">Technical.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--color-muted)] sm:text-xl">
            {IDENTITY.oneLiner}
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
              Kimber Sykes is a freelance {IDENTITY.rolesLine} with {IDENTITY.yearsExperience} years leading
              large-scale corporate conferences, summits, product launches, experiential brand activations and sports
              sponsorship programmes.
            </p>
            <p>
              Services include{" "}
              <Link href="/about#executive-production" className="text-[var(--color-accent)] hover:underline">
                executive production
              </Link>{" "}
              and project leadership,{" "}
              <Link href="/about#production-management" className="text-[var(--color-accent)] hover:underline">
                on-site production management
              </Link>
              ,{" "}
              <Link href="/about#technical-direction" className="text-[var(--color-accent)] hover:underline">
                technical direction
              </Link>
              , vendor sourcing, and budget oversight for seven-figure programmes.
            </p>
            <p>
              Based in London and available for contract work across Europe and globally.{" "}
              <Link href="/about" className="text-[var(--color-accent)] hover:underline">
                More about Kimber
              </Link>
              , or get in touch via{" "}
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
