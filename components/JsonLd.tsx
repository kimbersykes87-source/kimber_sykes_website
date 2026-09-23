function safeJsonLdStringify(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const items = Array.isArray(data) ? data : [data];
  const payload =
    items.length === 1 && typeof items[0]["@context"] === "string"
      ? items[0]
      : {
          "@context": "https://schema.org",
          "@graph": items,
        };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(payload) }}
    />
  );
}
