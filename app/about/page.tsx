import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container, Section } from "@/components/layout";
import { getProjectBySlug, mapCountries } from "@/lib/data";
import { clientAndProject } from "@/lib/case-study-meta";
import { getPortfolioPdfHref } from "@/lib/downloads";
import { IDENTITY } from "@/lib/identity";
import { DEFAULT_OG_IMAGE_ALT, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `About ${IDENTITY.name}: ${IDENTITY.roles.join(", ")}`,
  description: `Who is ${IDENTITY.name}? London-based freelance ${IDENTITY.rolesLine} with ${IDENTITY.yearsExperience} years in conferences, activations and sport.`,
  path: "/about",
  ogType: "profile",
});

const linkClass = "text-[var(--color-accent)] hover:underline";

/** Link to a case study by slug; fails the build if the slug does not exist. */
function Work({ slug, children }: { slug: string; children?: ReactNode }) {
  const p = getProjectBySlug(slug);
  if (!p) throw new Error(`About page links to missing case study: ${slug}`);
  return (
    <Link href={`/work/${p.slug}`} className={linkClass}>
      {children ?? clientAndProject(p)}
    </Link>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-12 font-display text-xl font-semibold text-[var(--color-foreground)]">{children}</h2>;
}

const strong = "text-[var(--color-foreground)]";

export default function AboutPage() {
  const portfolioHref = getPortfolioPdfHref();
  const countries = mapCountries.length;

  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-neutral-900 lg:sticky lg:top-24 lg:mx-0 lg:self-start">
            <Image
              src={IDENTITY.portrait.src}
              alt={DEFAULT_OG_IMAGE_ALT}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 320px"
              priority
            />
          </div>
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[var(--color-accent)]">Why hire me</p>
            <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">About {IDENTITY.name}</h1>

            <div className="mt-8 space-y-4 text-[var(--color-muted)] leading-relaxed">
              <p className="text-lg text-[var(--color-foreground)]">{IDENTITY.oneLiner}</p>
              <p>
                He has {IDENTITY.yearsExperience} years of experience in live events and has delivered work on site in{" "}
                <Link href="/where" className={linkClass}>
                  {countries} countries
                </Link>
                . Agencies engage him to lead production for their clients, from briefing and budget through technical
                delivery and derig.
              </p>
            </div>

            <H2>How can Kimber help your agency?</H2>
            <p className="mt-4 text-[var(--color-muted)] leading-relaxed">
              Agencies bring Kimber in for three distinct roles. Each links to the case studies that show it.
            </p>
            {IDENTITY.services.map((svc) => (
              <section key={svc.id} id={svc.id} aria-labelledby={`${svc.id}-heading`} className="mt-10 scroll-mt-24">
                <h3 id={`${svc.id}-heading`} className="font-display text-lg font-semibold text-[var(--color-foreground)]">
                  {svc.name}
                </h3>
                <p className="mt-3 text-[var(--color-muted)] leading-relaxed">{svc.intro}</p>
                <p className="mt-4 text-sm font-medium text-[var(--color-foreground)]">What&apos;s included</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
                  {svc.included.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-[var(--color-muted)] leading-relaxed">
                  <strong className={strong}>Typical projects:</strong> {svc.typical}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">
                  <strong className={strong}>Case studies:</strong>{" "}
                  {svc.caseStudies.map((slug, i) => (
                    <span key={slug}>
                      {i > 0 ? ", " : null}
                      <Work slug={slug} />
                    </span>
                  ))}
                </p>
              </section>
            ))}

            <H2>Which sectors does he work in?</H2>
            <div className="mt-6 space-y-4 text-[var(--color-muted)] leading-relaxed">
              <p>
                <strong className={strong}>B2B tech conferences:</strong>{" "}
                <Work slug="google-cloud-summit-2026">Google Cloud Summit London</Work> and Xerocon, plus the{" "}
                <Work slug="visa-everywhere" /> in Paris.
              </p>
              <p>
                <strong className={strong}>Consumer brand activations:</strong> Production Director for the{" "}
                <Work slug="netflix-stranger-things">Netflix Stranger Things fan experience</Work> in Paris, Executive
                Producer for the <Work slug="canva-studio" /> in London, and Senior Producer for the{" "}
                <Work slug="google-pixel-3">Google Pixel 3 Curiosity Rooms</Work> on Regent Street.
              </p>
              <p>
                <strong className={strong}>Sports sponsorship programmes:</strong> Emirates activations across tennis
                (ATP Finals at The O2 in London, Roland Garros, US Open, Barcelona Open, Indian Wells, Rome), PGA golf
                (Dubai, Kuala Lumpur, Shanghai), the <Work slug="emirates-cricket">Cricket World Cup</Work> in Australia
                and New Zealand and the Commonwealth Games in Glasgow (see the{" "}
                <Work slug="emirates-sports">global sports programme</Work>), Mastercard at the{" "}
                <Work slug="mastercard-ucl">UEFA Champions League Final</Work> and{" "}
                <Work slug="mastercard-british-open">The Open</Work>, and Visa at the FIFA Women&apos;s World Cup.
              </p>
            </div>

            <H2>Where does he work?</H2>
            <p className="mt-6 text-[var(--color-muted)] leading-relaxed">
              Kimber is based in {IDENTITY.baseLocality} and works worldwide. He has delivered work on site in{" "}
              {countries} countries across Europe, the Middle East, Africa, Asia-Pacific and the Americas. The full list
              of countries and cities is on <Link href="/where" className={linkClass}>Where I have worked</Link>.
            </p>

            <H2>Career summary</H2>
            <ol className="mt-6 space-y-5 border-l border-white/10 pl-5">
              {IDENTITY.career.map((c) => (
                <li key={`${c.years}-${c.organisation}`}>
                  <p className="text-sm text-[var(--color-accent)]">{c.years}</p>
                  <p className="font-medium text-[var(--color-foreground)]">
                    {c.organisation}, {c.place}: {c.role}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)] leading-relaxed">{c.summary}</p>
                </li>
              ))}
            </ol>

            <H2>Credentials summary</H2>
            <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
              <li>
                <strong className={strong}>Roles:</strong> Executive Producer, Senior Production Manager, Production
                Manager, Technical Director, Project Lead, Production Director
              </li>
              <li>
                <strong className={strong}>Specialisms:</strong> {IDENTITY.knowsAbout.join(", ")}
              </li>
              <li>
                <strong className={strong}>Clients include:</strong> Google, Netflix, Canva, Mastercard, Visa, Emirates,
                Samsung, Stella McCartney, Johnson &amp; Johnson, MTV, Microsoft, Xero, Aperol, Electronic Arts, NTT
                Data, Geely Auto, Yoto. <Link href="/clients" className={linkClass}>See all clients and agencies</Link>.
              </li>
              <li>
                <strong className={strong}>Agencies include:</strong> Wonder, INVNT, Jack Morton, Amplify, Imagination,
                Octagon, Pulse Group, BMF, Curiious, Akcelo, AGB Events, Yakusan, Emotive, We Are Listen, Exposure, K&amp;K
                Productions, dotdotdot, Bacchus, Blondefish
              </li>
              <li>
                <strong className={strong}>Sports tournaments delivered:</strong> ATP Finals, Roland Garros, US Open
                and ATP tennis events, PGA golf, Cricket World Cup, Commonwealth Games, UEFA Champions League Final, The
                Open, FIFA Women&apos;s World Cup
              </li>
              <li>
                <strong className={strong}>Based:</strong> {IDENTITY.baseLocality}, UK. Available worldwide.
              </li>
              <li>
                <strong className={strong}>Experience:</strong> {IDENTITY.yearsExperience} years
              </li>
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="/Kimber%20Sykes%20-%20CV%20-%202026.pdf"
                className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Download CV (PDF)
              </a>
              {portfolioHref ? (
                <a
                  href={portfolioHref}
                  className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Download professional portfolio (PDF)
                </a>
              ) : (
                <p className="max-w-md self-center text-sm text-[var(--color-muted)]">
                  Professional portfolio (PDF) is hosted on <code className="text-xs">assets.kimbersykes.com</code>{" "}
                  (not bundled on Pages). See{" "}
                  <Link href="/contact" className={linkClass}>
                    How
                  </Link>{" "}
                  to request a copy if the download link is unavailable.
                </p>
              )}
            </div>

            <p className="mt-6">
              <Link href="/contact" className={linkClass}>
                How to contact me →
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
