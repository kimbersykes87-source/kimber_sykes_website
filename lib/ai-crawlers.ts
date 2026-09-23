/**
 * User-Agent tokens for known AI / LLM crawlers.
 * Keep in sync: app/robots.ts, workers/crawler-logger, and any analytics matchers.
 */
export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Amazonbot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "DiffBot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "ImagesiftBot",
  "peer39_crawler",
  "Timpibot",
  "YouBot",
] as const;

export type AiCrawlerUserAgent = (typeof AI_CRAWLER_USER_AGENTS)[number];

export const AI_CRAWLER_BOT_NAMES: { needle: string; name: string }[] = AI_CRAWLER_USER_AGENTS.map(
  (name) => ({ needle: name, name }),
);
