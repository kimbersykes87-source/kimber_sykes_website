import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Container, Section } from "@/components/layout";
import { getPortfolioPdfHref } from "@/lib/downloads";
import { buildHomePersonSchema } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "About — Executive Producer & Production Manager",
  description:
    "About Kimber Sykes: 23 years as freelance Executive Producer, Production Manager, and Technical Director on corporate summits, activations, and sports programmes.",
  path: "/about",
});

export default function AboutPage() {
  const site = getSiteUrl();
  const portfolioHref = getPortfolioPdfHref();

  return (
    <>
      <JsonLd data={buildHomePersonSchema(site)} />
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-neutral-900 lg:mx-0">
              <Image
                src="/images/about/portrait.jpg"
                alt="Kimber Sykes, Executive Producer and Production Manager"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
                priority
              />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">Why hire me</h1>
              <div className="mt-8 max-w-3xl space-y-4 text-[var(--color-muted)] leading-relaxed">
                <p>
                  Kimber Sykes is a freelance Executive Producer, Production Manager, and Technical Director with 23
                  years delivering large-scale live work in three lanes: consumer brand activations, touring sports
                  sponsorship programmes, and B2B conferences.
                </p>
                <p>
                  In consumer activations: Production Director for the Netflix Stranger Things fan experience in Paris,
                  Executive Producer for the Canva Studio pop-up in London, and Senior Producer for the Google Pixel 3
                  Curiosity Rooms on Regent Street. In sport, Kimber has delivered Emirates programmes across ATP
                  (London, Paris, Barcelona, New York, Indian Wells, Rome), PGA (Dubai, Kuala Lumpur, Shanghai), Cricket
                  World Cup (Australia and New Zealand), and the Commonwealth Games in Glasgow, plus Mastercard at the
                  UEFA Champions League Final and British Open Golf, and Visa at the FIFA Women&apos;s World Cup. In B2B
                  tech, credits include Production Manager for Google Cloud Summit for a 3,000 PAX conference over the
                  last three years, and Technical Director for Xerocon Denver, London & Nashville.
                </p>
                <p>
                  Based in London and available worldwide, Kimber works with global brands including Google, Netflix, Canva,
                  Mastercard, Visa, Emirates, Samsung, Stella McCartney, and others, typically via agencies such as
                  Imagination, Jack Morton, Amplify, Wonder, Octagon, INVNT, BMF, Pulse Group, and Curiious. The
                  through-line is the same: disciplined production leadership from briefing and budget to technical
                  delivery and derig.
                </p>
              </div>

              <h2 className="mt-12 font-display text-xl font-semibold text-[var(--color-foreground)]">
                Credentials summary
              </h2>
              <ul className="mt-6 max-w-3xl list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
                <li>
                  <strong className="text-[var(--color-foreground)]">Roles:</strong> Executive Producer, Production
                  Manager, Technical Director, Project Lead, Production Director
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Specialisms:</strong> Consumer Brand Activations,
                  Sports Sponsorship Activations, B2B Conferences, Major Tournament Delivery, Experiential Events, AV
                  Technical Delivery, Exhibition Floor Management, Show Flow, Live Event Production, Touring Global
                  Programmes
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Clients include:</strong> Google, Netflix, Canva,
                  Mastercard, Visa, Emirates, Samsung, Stella McCartney, Johnson &amp; Johnson, MTV, Microsoft, Xero,
                  Aperol, EA Sports, NTT Data, Geely Auto
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Agencies include:</strong> Imagination, Jack Morton,
                  Amplify, Wonder, Octagon, INVNT, BMF, Pulse Group, Curiious, AGB Events, Yakusan, Emotive, We Are Listen,
                  Exposure, K&amp;K Productions, Bacchus, Blondefish
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Sports tournaments delivered:</strong> ATP Tennis
                  Tour, PGA Golf Tour, Cricket World Cup, Commonwealth Games, UEFA Champions League, British Open Golf,
                  FIFA Women&apos;s World Cup
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Based:</strong> London, UK
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Available:</strong> Worldwide
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">Experience:</strong> 23 years
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
                    Professional portfolio (PDF) is hosted on{" "}
                    <code className="text-xs">assets.kimbersykes.com</code> (not bundled on Pages). See{" "}
                    <Link href="/contact" className="text-[var(--color-accent)] hover:underline">
                      How
                    </Link>{" "}
                    to request a copy if the download link is unavailable.
                  </p>
                )}
              </div>

              <p className="mt-6">
                <Link href="/contact" className="text-[var(--color-accent)] hover:underline">
                  How →
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
