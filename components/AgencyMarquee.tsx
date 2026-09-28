import { agencies } from "@/lib/data";
import { logoFit } from "@/lib/logoDisplay";

type AgencyMarqueeProps = {
  /** When true, omit outer border/background (compose inside a parent section). */
  strip?: boolean;
};

/** Home: agency marks in `data/agencies.json` order (duplicate for seamless marquee). Same sizing as LogoMarquee. */
export function AgencyMarquee({ strip }: AgencyMarqueeProps) {
  const dup = [...agencies, ...agencies];
  // No padding/gap on the track: translateX(-50%) must equal exactly one set of cells.
  const inner = (
    <div className="logo-band flex w-max animate-marquee">
      {dup.map((a, i) => {
        const logo = logoFit(a);
        return (
          <div key={`${a.id}-${i}`} className="logo-band-cell flex shrink-0 items-center justify-center">
            <img
              src={a.file}
              alt={i < agencies.length ? a.alt : ""}
              aria-hidden={i < agencies.length ? undefined : true}
              width={logo.width}
              height={logo.height}
              style={logo.style}
              loading="eager"
              decoding="async"
              className={logo.className}
            />
          </div>
        );
      })}
    </div>
  );

  if (strip) {
    return <div className="relative overflow-hidden py-4 sm:py-6">{inner}</div>;
  }

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black/30 py-6" aria-label="Agency logos">
      {inner}
    </div>
  );
}
