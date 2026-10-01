import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/layout";

export const metadata: Metadata = {
  title: { absolute: "Page not found | Kimber Sykes" },
};

const links = [
  { href: "/work", label: "What I have delivered" },
  { href: "/about", label: "About Kimber Sykes" },
  { href: "/contact", label: "How to contact me" },
];

export default function NotFound() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <p className="text-sm font-medium text-[var(--color-accent)]">404</p>
        <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mt-6 text-lg text-[var(--color-muted)]">
          That page has moved or never existed. These are the best places to start:
        </p>
        <ul className="mt-8 space-y-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-[var(--color-accent)] hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
