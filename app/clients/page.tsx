import Image from "next/image";
import type { Metadata } from "next";
import { agencies, clients } from "@/lib/data";
import { logoFit } from "@/lib/logoDisplay";
import { Container, Section } from "@/components/layout";
import { buildPageMetadata } from "@/lib/seo";
import type { ReactNode } from "react";
import type { LogoEntry } from "@/lib/types";

const tileClass = "flex items-center justify-center rounded-lg border border-white/10 bg-black/20 p-4 sm:p-6";

function LogoTile({ entry, children }: { entry: LogoEntry; children: ReactNode }) {
  if (!entry.url) {
    return <li className={tileClass}>{children}</li>;
  }
  return (
    <li className="flex">
      <a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${entry.name} website (opens in a new tab)`}
        className={`${tileClass} w-full transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60`}
      >
        {children}
      </a>
    </li>
  );
}

export const metadata: Metadata = buildPageMetadata({
  title: "Clients & Agencies — Global Brands",
  description:
    "Brands and agencies Kimber Sykes has partnered with as Executive Producer, Production Manager, or Technical Director, including Google, Netflix, Mastercard, and Emirates.",
  path: "/clients",
});

export default function ClientsPage() {
  return (
    <Section>
      <Container>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Who I have worked with</h1>

        <h2 className="mt-14 font-display text-xl font-semibold">Brands</h2>
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {clients.map((c) => {
            const logo = logoFit(c);
            return (
              <LogoTile key={c.id} entry={c}>
                <div className="logo-tile-box">
                  <Image
                    src={c.file}
                    alt={c.alt}
                    width={logo.width}
                    height={logo.height}
                    style={logo.style}
                    className={logo.className}
                  />
                </div>
              </LogoTile>
            );
          })}
        </ul>

        <hr className="my-16 border-white/10" />

        <h2 className="font-display text-xl font-semibold">Agencies</h2>
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {agencies.map((a) => {
            const logo = logoFit(a);
            return (
              <LogoTile key={a.id} entry={a}>
                <div className="logo-tile-box">
                  <Image
                    src={a.file}
                    alt={a.alt}
                    width={logo.width}
                    height={logo.height}
                    style={logo.style}
                    className={logo.className}
                  />
                </div>
              </LogoTile>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
