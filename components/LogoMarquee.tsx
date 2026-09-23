import { getMarqueeClients } from "@/lib/marquee";
import { marqueeLogoDisplay } from "@/lib/logoDisplay";

type LogoMarqueeProps = {
  /** When true, omit outer border/background (compose inside a parent section). */
  strip?: boolean;
};

export function LogoMarquee({ strip }: LogoMarqueeProps) {
  const ordered = getMarqueeClients();
  const dup = [...ordered, ...ordered];

  const inner = (
    <div className="flex w-max animate-marquee pr-6 sm:pr-8">
      {dup.map((c, i) => {
        const logo = marqueeLogoDisplay(c);
        return (
          <div
            key={`${c.id}-${i}`}
            className="flex w-[9rem] shrink-0 items-center justify-center px-3 sm:w-[10.5rem] sm:px-4"
          >
            <img
          src={c.file}
          alt={c.alt}
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
    return <div className="relative overflow-hidden py-6">{inner}</div>;
  }

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black/30 py-6" aria-label="Client logos">
      {inner}
    </div>
  );
}
