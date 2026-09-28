import type { LogoEntry } from "@/lib/types";
import { clients } from "@/lib/data";

/** Clients we have worked for that have no logo, so they are counted but not shown in the marquee. */
export const CLIENTS_WITHOUT_LOGO: string[] = ["Arise Fashion"];

/** Home marquee: every registered client with a logo, alphabetical. */
export const MARQUEE_CLIENT_IDS: string[] = [...clients]
  .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
  .map((c) => c.id);

const clientById = new Map(clients.map((c) => [c.id, c]));

/** Resolved client entries for the home Brands marquee (same order as `MARQUEE_CLIENT_IDS`). */
export function getMarqueeClients(): LogoEntry[] {
  return MARQUEE_CLIENT_IDS.map((id) => clientById.get(id)).filter((c): c is LogoEntry => Boolean(c));
}

/** Home “Clients” stat: logo clients plus clients without a logo. */
export const CLIENT_COUNT = MARQUEE_CLIENT_IDS.length + CLIENTS_WITHOUT_LOGO.length;
