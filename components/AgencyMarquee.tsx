import Image from "next/image";
import { agencies } from "@/lib/data";
import { marqueeLogoDisplay } from "@/lib/logoDisplay";

type AgencyMarqueeProps = {
  /** When true, omit outer border/background (compose inside a parent section). */
  strip?: boolean;
};

/** Home: agency marks in `data/agencies.json` order (duplicate for seamless marquee). */
export function AgencyMarquee({ strip }: AgencyMarqueeProps) {
  const dup = [...agencies, ...agencies];
  const inner = (
    <div className="flex w-max animate-marquee gap-12 pr-12">
      {dup.map((a, i) => {
        const logo = marqueeLogoDisplay(a);
        return (
          <div key={`${a.id}-${i}`} className="flex shrink-0 items-center justify-center">
            <Image
              src={a.file}
              alt={a.alt}
              width={logo.width}
              height={logo.height}
              style={logo.style}
              className={logo.className}
            />
          </div>
        );
      })}
    </div>
  );

  if (strip) {
    return <div className="relative overflow-hidden py-6">{inner}</div>;
  }

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black/30 py-6" aria-label="Agency logos">
      {inner}
    </div>
  );
}
