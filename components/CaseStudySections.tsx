import type { ReactNode } from "react";
import type { Project } from "@/lib/types";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-4 leading-relaxed text-[var(--color-muted)]">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

/**
 * Consistent case study structure. Sections only render when there are real facts for them;
 * nothing is padded or invented.
 */
export function CaseStudySections({ project: p }: { project: Project }) {
  return (
    <div className="mt-4 max-w-3xl">
      {p.brief ? (
        <Block title="What was the brief?">
          <p>{p.brief}</p>
        </Block>
      ) : null}
      {p.scale?.length ? (
        <Block title="Scale and constraints">
          <List items={p.scale} />
        </Block>
      ) : null}
      {p.responsibilities?.length ? (
        <Block title="What was Kimber responsible for?">
          <List items={p.responsibilities} />
        </Block>
      ) : null}
      {p.highlights?.length ? (
        <Block title="Technical and production highlights">
          <List items={p.highlights} />
        </Block>
      ) : null}
      {p.outcome ? (
        <Block title="Outcome">
          <p>{p.outcome}</p>
        </Block>
      ) : null}
    </div>
  );
}
