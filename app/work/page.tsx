import type { Metadata } from "next";
import { WorkProjectList } from "@/components/WorkProjectList";
import { Container, Section } from "@/components/layout";
import { projects } from "@/lib/data";
import { buildPageMetadata, pageTitle } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle("Event Production Portfolio and Case Studies"),
  description:
    "Case studies from Kimber Sykes as Executive Producer, Production Manager and Technical Director: tech conferences, brand activations and sports sponsorship.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <Section>
      <Container>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">What I have delivered</h1>
        {/* Rendered on the server: every case study link is in the static HTML. */}
        <WorkProjectList projects={projects} />
      </Container>
    </Section>
  );
}
