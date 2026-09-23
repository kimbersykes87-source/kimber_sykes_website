import type { LogoEntry } from "@/lib/types";
import { clients } from "@/lib/data";

/** Home marquee + “Global Brands” stat — every registered client, alphabetical. */
export const MARQUEE_CLIENT_IDS: string[] = [...clients]
  .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
  .map((c) => c.id);

const clientById = new Map(clients.map((c) => [c.id, c]));

/** Resolved client entries for the home Brands marquee (same order as `MARQUEE_CLIENT_IDS`). */
export function getMarqueeClients(): LogoEntry[] {
  return MARQUEE_CLIENT_IDS.map((id) => clientById.get(id)).filter((c): c is LogoEntry => Boolean(c));
}
