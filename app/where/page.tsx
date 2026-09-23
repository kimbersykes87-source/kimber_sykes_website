import type { Metadata } from "next";
import { DeliveryLocationsList } from "@/components/DeliveryLocationsList";
import { KimberRightNow } from "@/components/KimberRightNow";
import { WorldMap } from "@/components/WorldMap";
import { Container, Section } from "@/components/layout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Global Project Locations — 18 Countries",
  description:
    "Countries and cities where Kimber Sykes has delivered events as Executive Producer, Production Manager, or Technical Director across Europe, APAC, and the Americas — including Toronto, Vancouver, Montreal, and Barcelona.",
  path: "/where",
});

export default function WherePage() {
  return (
    <Section>
      <Container>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Where I have worked</h1>
        <div className="mt-8">
          <KimberRightNow />
        </div>
        <DeliveryLocationsList />
        <div className="mt-10">
          <WorldMap />
        </div>
      </Container>
    </Section>
  );
}
