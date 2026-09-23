import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { WorkProjectList } from "@/components/WorkProjectList";
import { Container, Section } from "@/components/layout";
import { projects } from "@/lib/data";
import { buildWorkIndexSchema } from "@/lib/json-ld";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio — Corporate Events & Brand Activations",
  description:
    "Case studies from Kimber Sykes: Executive Producer, Production Manager, and Technical Director on B2B summits, experiential activations, and sports programmes.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <JsonLd data={buildWorkIndexSchema()} />
      <Section>
        <Container>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">What I have delivered</h1>
          <Suspense
            fallback={
              <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <li key={p.slug} className="h-64 animate-pulse rounded-lg bg-white/5" aria-hidden />
                ))}
              </ul>
            }
          >
            <WorkProjectList projects={projects} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
