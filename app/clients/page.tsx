import Image from "next/image";
import type { Metadata } from "next";
import { agencies, clients } from "@/lib/data";
import { clientsPageLogoDisplay } from "@/lib/logoDisplay";
import { Container, Section } from "@/components/layout";
import { buildPageMetadata } from "@/lib/seo";

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
            const logo = clientsPageLogoDisplay(c);
            return (
              <li key={c.id} className="flex items-center justify-center rounded-lg border border-white/10 bg-black/20 p-6">
                <Image
                  src={c.file}
                  alt={c.alt}
                  width={logo.width}
                  height={logo.height}
                  style={logo.style}
                  className={logo.className}
                />
              </li>
            );
          })}
        </ul>

        <hr className="my-16 border-white/10" />

        <h2 className="font-display text-xl font-semibold">Agencies</h2>
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {agencies.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-center rounded-lg border border-white/10 bg-black/20 p-6"
            >
              <Image
                src={a.file}
                alt={a.alt}
                width={160}
                height={48}
                className="logo-on-dark h-10 w-auto max-w-[140px] object-contain"
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
