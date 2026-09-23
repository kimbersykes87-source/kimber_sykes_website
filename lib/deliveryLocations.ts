import { deliveryLocations } from "@/lib/data";

/** map.json country name → delivery-locations.json country label */
const MAP_COUNTRY_TO_DELIVERY: Record<string, string> = {
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
};

export function formatDeliveryLocationLine(country: string, cities: string[]): string {
  return `${country} (${cities.join(", ")})`;
}

export function getDeliveryCitiesForMapCountry(mapCountryName: string): string[] {
  const label = MAP_COUNTRY_TO_DELIVERY[mapCountryName] ?? mapCountryName;
  return deliveryLocations.find((d) => d.country === label)?.cities ?? [];
}
