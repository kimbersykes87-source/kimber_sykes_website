import { IDENTITY } from "@/lib/identity";

export const LINKEDIN_URL = IDENTITY.sameAs.find((u) => u.includes("linkedin.com")) ?? "";

export const CONTACT = {
  email: IDENTITY.contact.email,
  phoneUk: IDENTITY.contact.phoneUk,
  phoneUs: IDENTITY.contact.phoneUs,
} as const;
