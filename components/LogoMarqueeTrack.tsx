"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Seamless marquee: SSR outputs one horizontal strip; on the client we clone it *beside*
 * the original inside the same animated row (keyframes use translateX(-50%)).
 * Appending to the overflow-hidden parent stacks rows — never do that.
 */
export function LogoMarqueeTrack({ children }: { children: ReactNode }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const row = rowRef.current;
    if (!strip || !row || strip.dataset.cloned === "true") return;
    const clone = strip.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    row.appendChild(clone);
    strip.dataset.cloned = "true";
  }, []);

  return (
    <div ref={rowRef} className="flex w-max animate-marquee">
      <div ref={stripRef} className="flex shrink-0 gap-12 pr-12">
        {children}
      </div>
    </div>
  );
}
