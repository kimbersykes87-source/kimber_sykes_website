export function splitBodyParagraphs(body: string): string[] {
  const trimmed = body.trim();
  const byBreaks = trimmed.split(/\n\n+/).filter(Boolean);
  if (byBreaks.length > 1) return byBreaks;
  const s = byBreaks[0] ?? trimmed;
  const sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 2) return [s];
  const mid = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, mid).join(" "), sentences.slice(mid).join(" ")].filter(Boolean);
}

export function excerptFirstSentence(body: string): string {
  const sentences = body.trim().split(/(?<=[.!?])\s+/);
  const first = sentences[0]?.trim();
  if (first && first.length >= 40) return first.endsWith(".") ? first : `${first}.`;
  return body.trim().slice(0, 160);
}
