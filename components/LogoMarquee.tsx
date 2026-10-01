import { getMarqueeClients } from "@/lib/marquee";
import { logoFit } from "@/lib/logoDisplay";

type LogoMarqueeProps = {
  /** When true, omit outer border/background (compose inside a parent section). */
  strip?: boolean;
};

export function LogoMarquee({ strip }: LogoMarqueeProps) {
  const ordered = getMarqueeClients();
  const dup = [...ordered, ...ordered];

  // No padding/gap on the track: translateX(-50%) must equal exactly one set of cells,
  // otherwise the loop jumps by half the padding each cycle. Spacing lives inside each cell
  // (fixed `.logo-band-cell` width per breakpoint, logo sized by `.logo-fit`).
  const inner = (
    <div className="logo-band flex w-max animate-marquee" style={{ animationDuration: "68s" }}>
      {dup.map((c, i) => {
        const logo = logoFit(c);
        return (
          <div key={`${c.id}-${i}`} className="logo-band-cell flex shrink-0 items-center justify-center">
            <img
              src={c.file}
              alt={i < ordered.length ? c.alt : ""}
              aria-hidden={i < ordered.length ? undefined : true}
              width={logo.width}
              height={logo.height}
              style={logo.style}
              loading="eager"
              fetchPriority="low"
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
    <div className="relative overflow-hidden border-y border-white/10 bg-black/30 py-6" aria-label="Client logos">
      {inner}
    </div>
  );
}
