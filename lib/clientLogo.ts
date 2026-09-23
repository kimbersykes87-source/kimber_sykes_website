import { clients } from "@/lib/data";

/** Map panel client labels from map.json → clients.json id when names don't match exactly. */
const ID_BY_CLIENT_LABEL: Record<string, string> = {
  "geely auto": "geely",
  "aperol spritz": "aperol",
  "johnson & johnson": "johnson-johnson",
  "stella mccartney": "stella-mccartney",
  "ea sports": "ea-sports",
  "ntt data": "ntt-data",
  "tourism nt": "tourism-nt",
  "destination nsw": "destination-nsw",
  "aqua rugby australia": "aqua-rugby",
  "arise fashion": "arise-fashion",
  "expo 2020": "expo-2020",
  "gunpowder plot": "gunpowder-plot",
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

export function getLogoEntryForClient(clientName: string) {
  const key = norm(clientName);
  const id = ID_BY_CLIENT_LABEL[key];
  if (id) {
    const hit = clients.find((c) => c.id === id);
    if (hit) return hit;
  }
  const exact = clients.find((c) => norm(c.name) === key);
  if (exact) return exact;
  return clients.find((c) => key.startsWith(norm(c.name)) || norm(c.name).startsWith(key.split(/\s+/)[0] ?? ""));
}
