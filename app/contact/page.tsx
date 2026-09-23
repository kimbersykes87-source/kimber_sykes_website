import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { Container, Section } from "@/components/layout";
import { CONTACT, LINKEDIN_URL } from "@/lib/contact";
import { buildContactPageSchema, buildHomePersonSchema } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact — Freelance Event Production",
  description:
    "Contact Kimber Sykes for freelance Executive Producer, Production Manager, or Technical Director contracts. Based in London, available worldwide.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[buildContactPageSchema(), buildHomePersonSchema()]} />
      <Section>
      <Container className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">How to contact me</h1>
        <p className="mt-6 text-lg text-[var(--color-muted)]">
          Available for freelance contracts. Get in touch.
        </p>
        <ul className="mt-10 space-y-4 text-[var(--color-foreground)]">
          <li>
            <span className="block text-sm text-[var(--color-muted)]">Email</span>
            <a href={`mailto:${CONTACT.email}`} className="text-[var(--color-accent)] hover:underline">
              {CONTACT.email}
            </a>
          </li>
          <li>
            <span className="block text-sm text-[var(--color-muted)]">Phone (UK)</span>
            <a href={`tel:${CONTACT.phoneUk}`} className="hover:underline">
              +44 755 367 3133
            </a>
          </li>
          <li>
            <span className="block text-sm text-[var(--color-muted)]">Phone (US)</span>
            <a href={`tel:${CONTACT.phoneUs}`} className="hover:underline">
              +1 323 536 2611
            </a>
          </li>
          <li>
            <span className="block text-sm text-[var(--color-muted)]">LinkedIn</span>
            <a href={LINKEDIN_URL} className="text-[var(--color-accent)] hover:underline" rel="me">
              Kimber Sykes on LinkedIn
            </a>
          </li>
        </ul>
        <p className="mt-12 text-sm text-[var(--color-muted)]">
          <Link href="/work" className="text-[var(--color-accent)] hover:underline">
            View selected projects
          </Link>
        </p>
      </Container>
    </Section>
    </>
  );
}
