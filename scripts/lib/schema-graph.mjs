/**
 * Single source for all JSON-LD on kimbersykes.com.
 * Every page gets one @graph whose nodes share stable @ids, so engines can resolve
 * the Person, the business, the website and each case study as one connected entity.
 *
 * Global @ids:
 *   {site}/#person    Person (Kimber Sykes)
 *   {site}/#business  ProfessionalService (sole trader)
 *   {site}/#website   WebSite
 *   {site}/#portrait  ImageObject
 * Per page:
 *   {url}#webpage, {url}#breadcrumb, and for case studies {url}#work
 */
import fs from "node:fs";
import path from "node:path";

export function readJpegOrPngSize(file) {
  try {
    const buf = fs.readFileSync(file);
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch {
    /* unknown size */
  }
  return null;
}

const SECTOR_LABEL = (identity, sector) => identity.sectors[sector] ?? sector;

export function createSchemaBuilder({ site, identity, projects, publicDir }) {
  const ids = {
    person: `${site}/#person`,
    business: `${site}/#business`,
    website: `${site}/#website`,
    portrait: `${site}/#portrait`,
    workCollection: `${site}/work#webpage`,
  };
  const pageUrl = (route) => (route === "/" ? site : `${site}${route}`);
  const abs = (p) => `${site}${p.startsWith("/") ? p : `/${p}`}`;
  const address = {
    "@type": "PostalAddress",
    addressLocality: identity.baseLocality,
    addressCountry: identity.baseCountryCode,
  };

  function imageObject(src, id, caption) {
    const size = readJpegOrPngSize(path.join(publicDir, decodeURIComponent(src)));
    return {
      "@type": "ImageObject",
      ...(id ? { "@id": id } : {}),
      url: abs(src),
      contentUrl: abs(src),
      ...(size ?? {}),
      ...(caption ? { caption } : {}),
    };
  }

  function personNode() {
    return {
      "@type": "Person",
      "@id": ids.person,
      name: identity.name,
      url: site,
      image: { "@id": ids.portrait },
      jobTitle: identity.roles,
      description: identity.oneLiner,
      hasOccupation: identity.roles.map((role) => ({
        "@type": "Occupation",
        name: role,
        occupationLocation: { "@type": "City", name: identity.baseLocality },
      })),
      address,
      homeLocation: { "@type": "Place", name: identity.baseLocality, address },
      knowsAbout: identity.knowsAbout,
      sameAs: identity.sameAs,
      email: `mailto:${identity.contact.email}`,
      worksFor: { "@id": ids.business },
      mainEntityOfPage: { "@id": `${site}/about#webpage` },
    };
  }

  function businessNode() {
    return {
      "@type": "ProfessionalService",
      "@id": ids.business,
      name: identity.businessName,
      description: identity.shortLine,
      url: site,
      image: { "@id": ids.portrait },
      founder: { "@id": ids.person },
      employee: { "@id": ids.person },
      address,
      areaServed: identity.areaServed,
      knowsAbout: identity.knowsAbout,
      email: identity.contact.email,
      telephone: identity.contact.phoneUk,
    };
  }

  function websiteNode() {
    return {
      "@type": "WebSite",
      "@id": ids.website,
      name: identity.name,
      url: site,
      description: identity.shortLine,
      inLanguage: "en-GB",
      publisher: { "@id": ids.person },
      about: { "@id": ids.person },
    };
  }

  function breadcrumbNode(route, crumbs) {
    return {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl(route)}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    };
  }

  function webPageNode(route, type, { title, description, extra = {}, breadcrumb = true }) {
    return {
      "@type": type,
      "@id": `${pageUrl(route)}#webpage`,
      url: pageUrl(route),
      name: title,
      ...(description ? { description } : {}),
      isPartOf: { "@id": ids.website },
      inLanguage: "en-GB",
      ...(breadcrumb ? { breadcrumb: { "@id": `${pageUrl(route)}#breadcrumb` } } : {}),
      ...extra,
    };
  }

  function caseStudyNode(route, p) {
    const credit = {
      "@type": "Role",
      roleName: p.role,
      creator: { "@id": ids.person },
    };
    const node = {
      "@type": "CreativeWork",
      "@id": `${pageUrl(route)}#work`,
      name: p.project,
      alternateName: `${p.client}: ${p.project}`,
      url: pageUrl(route),
      description: p.summary ?? p.body.trim().split(/\n\n+/)[0],
      image: imageObject(
        p.heroImage,
        undefined,
        `${p.project.toLowerCase().includes(p.client.toLowerCase()) ? p.project : `${p.client} ${p.project}`}, ${p.location}, ${p.year}`,
      ),
      dateCreated: String(p.year),
      creator: credit,
      sponsor: { "@type": "Organization", name: p.client },
      locationCreated: { "@type": "Place", name: p.location },
      genre: SECTOR_LABEL(identity, p.sector),
      isPartOf: { "@id": ids.workCollection },
      mainEntityOfPage: { "@id": `${pageUrl(route)}#webpage` },
      inLanguage: "en-GB",
      ...(p.updated ? { dateModified: p.updated } : {}),
    };
    if (p.agency && p.agency !== "Independent") {
      node.producer = { "@type": "Organization", name: p.agency };
    }
    return node;
  }

  const home = { name: "Home", url: site };
  const STATIC = {
    "/": { type: "WebPage", crumb: null },
    "/about": { type: "ProfilePage", crumb: "About" },
    "/work": { type: "CollectionPage", crumb: "Work" },
    "/clients": { type: "WebPage", crumb: "Clients" },
    "/where": { type: "WebPage", crumb: "Where" },
    "/contact": { type: "ContactPage", crumb: "Contact" },
  };
  const projectBySlug = new Map(projects.map((p) => [p.slug, p]));

  /** Returns a JSON-LD object for the route, or null when the route gets no schema (e.g. 404). */
  return function buildGraph(route, { title, description }) {
    const core = [personNode(), businessNode(), websiteNode(), imageObject(identity.portrait.src, ids.portrait, `${identity.name}, freelance ${identity.rolesLine}`)];
    const nodes = [];

    const staticDef = STATIC[route];
    if (staticDef) {
      const extra = {};
      if (route === "/" || route === "/about") {
        extra.about = { "@id": ids.person };
        extra.primaryImageOfPage = { "@id": ids.portrait };
      }
      if (route === "/about") {
        extra.mainEntity = { "@id": ids.person };
        if (identity.aboutUpdated) extra.dateModified = identity.aboutUpdated;
        // The three services live on the About ("Why") page as anchored sections.
        const services = (identity.services ?? []).map((svc) => ({
          "@type": "Service",
          "@id": `${site}/about#${svc.id}`,
          name: svc.name,
          serviceType: svc.name,
          description: svc.intro,
          url: `${site}/about#${svc.id}`,
          provider: { "@id": ids.business },
          areaServed: identity.areaServed,
          subjectOf: svc.caseStudies
            .map((slug) => projectBySlug.get(slug))
            .filter(Boolean)
            .map((p) => ({
              "@type": "CreativeWork",
              "@id": `${site}/work/${p.slug}#work`,
              name: p.project,
              url: `${site}/work/${p.slug}`,
            })),
        }));
        nodes.push(...services);
        const business = core.find((n) => n["@id"] === ids.business);
        if (business && services.length) {
          business.makesOffer = services.map((svc) => ({ "@type": "Offer", itemOffered: { "@id": svc["@id"] } }));
        }
      }
      if (route === "/contact") extra.about = { "@id": ids.business };
      if (route === "/work") {
        extra.about = { "@id": ids.person };
        extra.mainEntity = {
          "@type": "ItemList",
          numberOfItems: projects.length,
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${site}/work/${p.slug}`,
            name: `${p.client}: ${p.project} (${p.role}, ${p.year})`,
          })),
        };
      }
      nodes.push(webPageNode(route, staticDef.type, { title, description, extra, breadcrumb: route !== "/" }));
      if (route !== "/") {
        nodes.push(breadcrumbNode(route, [home, { name: staticDef.crumb, url: pageUrl(route) }]));
      }
      return { "@context": "https://schema.org", "@graph": [...core, ...nodes] };
    }

    const m = route.match(/^\/work\/([^/]+)$/);
    const p = m && projectBySlug.get(m[1]);
    if (p) {
      nodes.push(
        webPageNode(route, "ItemPage", {
          title,
          description,
          extra: {
            mainEntity: { "@id": `${pageUrl(route)}#work` },
            about: { "@id": ids.person },
            primaryImageOfPage: { "@type": "ImageObject", url: abs(p.heroImage) },
            ...(p.updated ? { dateModified: p.updated } : {}),
          },
        }),
      );
      nodes.push(caseStudyNode(route, p));
      nodes.push(
        breadcrumbNode(route, [
          home,
          { name: "Work", url: `${site}/work` },
          { name: p.project, url: pageUrl(route) },
        ]),
      );
      return { "@context": "https://schema.org", "@graph": [...core, ...nodes] };
    }

    return null;
  };
}
