"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/layout";

const links = [
  { href: "/work", label: "What", tooltip: "What I have delivered" },
  { href: "/clients", label: "Who", tooltip: "Who I have worked with" },
  { href: "/where", label: "Where", tooltip: "Where I have worked" },
  { href: "/about", label: "Why", tooltip: "Why hire me" },
  { href: "/contact", label: "How", tooltip: "How to contact me" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/5 bg-[var(--color-background)]/90 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between sm:h-16">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-[var(--color-foreground)]"
        >
          Kimber Sykes
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex gap-8 text-sm">
            {links.map(({ href, label, tooltip }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      "group relative inline-flex items-center",
                      active
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]",
                    ].join(" ")}
                  >
                    <span>{label}</span>
                    <span
                      role="tooltip"
                      className={[
                        "pointer-events-none absolute left-1/2 top-full z-50",
                        "-translate-x-1/2 translate-y-2",
                        "whitespace-nowrap rounded-md border px-2.5 py-1 text-xs",
                        "bg-[var(--color-background)] text-[var(--color-foreground)] border-[var(--color-accent)]/40",
                        "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                        "max-w-[calc(100vw-2rem)] overflow-hidden text-ellipsis",
                      ].join(" ")}
                    >
                      {tooltip}
                      <span
                        aria-hidden
                        className={[
                          "absolute left-1/2 bottom-full -translate-x-1/2",
                          "h-0 w-0 border-x-[6px] border-b-[7px] border-x-transparent",
                          "border-b-[var(--color-background)]",
                        ].join(" ")}
                      />
                      <span
                        aria-hidden
                        className={[
                          "absolute left-1/2 bottom-full -translate-x-1/2 -translate-y-[1px]",
                          "h-0 w-0 border-x-[7px] border-b-[8px] border-x-transparent",
                          "border-b-[color:var(--color-accent)]/40",
                        ].join(" ")}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          type="button"
          className="inline-flex rounded-md p-2 text-[var(--color-foreground)] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </button>
      </Container>
      {open ? (
        <div id="mobile-menu" className="border-t border-white/5 bg-[var(--color-background)] md:hidden">
          <Container className="py-4">
            <ul className="flex flex-col gap-3">
              {links.map(({ href, label, tooltip }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block py-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="block text-base">{label}</span>
                    <span className="mt-0.5 block text-sm text-[var(--color-muted)]">{tooltip}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
