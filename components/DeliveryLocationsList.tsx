import { deliveryLocations } from "@/lib/data";
import { formatDeliveryLocationLine } from "@/lib/deliveryLocations";

export function DeliveryLocationsList() {
  return (
    <section className="mt-10" aria-labelledby="delivery-locations-heading">
      <h2 id="delivery-locations-heading" className="font-display text-xl font-semibold sm:text-2xl">
        Countries with on-site project delivery
      </h2>
      <ul className="mt-6 max-w-3xl space-y-2 text-[var(--color-muted)] leading-relaxed">
        {deliveryLocations.map((row) => (
          <li key={row.country}>
            {formatDeliveryLocationLine(row.country, row.cities)}
          </li>
        ))}
      </ul>
    </section>
  );
}
