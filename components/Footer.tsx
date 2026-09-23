import Link from "next/link";
import { Container } from "@/components/layout";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-sm text-[var(--color-muted)]">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Kimber Sykes. All rights reserved.</p>
        <p>
          <Link href="/contact" className="text-[var(--color-accent)] hover:underline">
            Get in touch
          </Link>
        </p>
      </Container>
    </footer>
  );
}
