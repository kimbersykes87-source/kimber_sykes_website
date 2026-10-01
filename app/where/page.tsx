import type { Metadata } from "next";
import { DeliveryLocationsList } from "@/components/DeliveryLocationsList";
import { KimberRightNow } from "@/components/KimberRightNow";
import { WorldMap } from "@/components/WorldMap";
import { Container, Section } from "@/components/layout";
import { mapCountries } from "@/lib/data";
import { buildPageMetadata, pageTitle } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle(`Where I Have Worked: ${mapCountries.length} Countries`),
  description: `Where Kimber Sykes has delivered events on site: ${mapCountries.length} countries across Europe, the Middle East, Africa, Asia-Pacific and the Americas.`,
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
