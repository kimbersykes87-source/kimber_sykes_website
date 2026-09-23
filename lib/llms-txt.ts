import { CONTACT, LINKEDIN_URL } from "@/lib/contact";
import { excerptFirstSentence } from "@/lib/body";
import { projects } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

/** Machine-readable site summary for LLMs and AI agents (llmstxt.org convention). */
export function buildLlmsTxt(): string {
  const site = getSiteUrl();
  const lines: string[] = [
    "# Kimber Sykes — Freelance Executive Producer",
    "",
    "> Freelance Executive Producer, Production Manager, and Technical Director based in London. 23 years of experience across 18 countries and seven-figure budgets. Specialising in large-scale corporate events, conferences, summits, and experiential brand activations. Available for contract project leadership across Europe and globally.",
    "",
    "## Services",
    "",
    "- Executive production for corporate conferences, summits, and product launches",
    "- Experiential and brand activations",
    "- On-site production management, build supervision, and de-rig oversight",
    "- Technical direction, AV delivery, and show flow",
    "- Vendor sourcing, budget management, and project leadership for seven-figure events",
    "",
    "## Case studies",
    "",
  ];

  for (const p of projects) {
    const summary = excerptFirstSentence(p.body);
    lines.push(`- [${p.client} — ${p.project}](${site}/work/${p.slug}): ${summary}`);
  }

  lines.push(
    "",
    "## Contact",
    "",
    `- Website: ${site}`,
    `- LinkedIn: ${LINKEDIN_URL}`,
    `- Contact form: ${site}/contact`,
    `- Email: ${CONTACT.email}`,
    `- Phone (UK): +44 755 367 3133`,
    `- Phone (US): +1 323 536 2611`,
    "",
  );

  return lines.join("\n");
}
