export type Sector = "B2B Tech" | "Consumer" | "Sports" | "Other";

export type Project = {
  slug: string;
  client: string;
  project: string;
  agency: string;
  role: string;
  year: number;
  location: string;
  sector: Sector;
  heroImage: string;
  gallery: string[];
  body: string;
};

export type MapProjectRow = {
  client: string;
  agency: string;
  project: string;
  /** Optional when year is unknown / not public. */
  year?: number;
};

export type MapCountry = {
  country: string;
  /** ISO 3166-1 alpha-2; map uses ISO 3166-1 alpha-3 via mapHighlightAlpha3. */
  countryCode: string;
  projects: MapProjectRow[];
};

export type DeliveryLocation = {
  country: string;
  cities: string[];
};

export type LogoEntry = {
  id: string;
  name: string;
  file: string;
  alt: string;
  /** Rendered size multiplier on Clients page and home marquee (default 1). */
  displayScale?: number;
};
