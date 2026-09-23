import { LINKEDIN_URL } from "@/lib/contact";
import { excerptFirstSentence } from "@/lib/body";
import type { Project } from "@/lib/types";
import { getSiteUrl } from "@/lib/site";

const JOB_TITLES =
  "Freelance Executive Producer, Production Manager and Technical Director";

const PERSON_DESCRIPTION =
  "Freelance Executive Producer, Production Manager and Technical Director specialising in B2B tech conferences, consumer brand activations, and major sports sponsorship programmes. 23 years experience. Based in London, available worldwide.";

/** Homepage WebSite schema with portfolio search. */
export function buildHomeWebSiteSchema(site = getSiteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kimber Sykes",
    url: site,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site}/work?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Homepage ProfessionalService schema. */
export function buildHomeProfessionalServiceSchema(site = getSiteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Kimber Sykes",
    description: PERSON_DESCRIPTION,
    url: site,
    image: `${site}/images/about/portrait.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "London",
      addressCountry: "UK",
    },
    areaServed: "Worldwide",
  };
}

/** Three separate homepage schemas (Person, WebSite, ProfessionalService). */
export function buildHomeJsonLdSchemas(site = getSiteUrl()) {
  return [
    buildHomePersonSchema(site),
    buildHomeWebSiteSchema(site),
    buildHomeProfessionalServiceSchema(site),
  ];
}

/** Homepage Person schema (single block per audit spec). */
export function buildHomePersonSchema(site = getSiteUrl()) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Kimber Sykes",
    gender: "Male",
    jobTitle: JOB_TITLES,
    description: PERSON_DESCRIPTION,
    url: site,
    image: `${site}/images/about/portrait.jpg`,
    sameAs: [LINKEDIN_URL],
    address: {
      "@type": "PostalAddress",
      addressLocality: "London",
      addressCountry: "UK",
    },
    knowsAbout: [
      "Executive Production",
      "Event Production Management",
      "Technical Direction",
      "B2B Conferences",
      "Consumer Brand Activations",
      "Experiential Marketing",
      "Sports Sponsorship Activations",
      "Live Event Production",
      "AV Technical Delivery",
      "Show Flow",
      "Exhibition Floor Management",
      "Touring Global Programmes",
    ],
    workLocation: { "@type": "Place", name: "Worldwide" },
  };
}

export function buildCreativeWorkSchema(project: Project) {
  const about = excerptFirstSentence(project.body);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${project.client}: ${project.project}`,
    creator: {
      "@type": "Person",
      name: "Kimber Sykes",
      jobTitle: project.role,
    },
    about,
    dateCreated: String(project.year),
    locationCreated: { "@type": "Place", name: project.location },
    publisher: { "@type": "Organization", name: project.agency },
    sponsor: { "@type": "Organization", name: project.client },
  };

  return schema;
}

export function buildContactPageSchema(site = getSiteUrl()) {
  return {
    "@type": "ContactPage",
    "@id": `${site}/contact#contactpage`,
    name: "Contact Kimber Sykes",
    url: `${site}/contact`,
    description:
      "Contact Kimber Sykes for freelance Executive Producer, Production Manager, or Technical Director contracts.",
  };
}

export function buildWorkIndexSchema(site = getSiteUrl()) {
  return {
    "@type": "CollectionPage",
    "@id": `${site}/work#collection`,
    name: "Portfolio — Kimber Sykes",
    url: `${site}/work`,
    description:
      "Selected projects delivered as Executive Producer, Production Manager, or Technical Director.",
  };
}
