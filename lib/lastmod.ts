import "server-only";
import { execFileSync } from "node:child_process";

const cache = new Map<string, Date | undefined>();

/**
 * Last git commit date touching any of the given repo paths. Used for honest sitemap
 * <lastmod> values instead of the build time. Returns undefined outside a git checkout.
 */
export function gitLastModified(...paths: string[]): Date | undefined {
  const key = paths.join("|");
  if (cache.has(key)) return cache.get(key);
  let result: Date | undefined;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    result = out ? new Date(out) : undefined;
  } catch {
    result = undefined;
  }
  cache.set(key, result);
  return result;
}

/** The newer of a git date and an explicit ISO date from content data. */
export function newest(...dates: (Date | string | undefined)[]): Date | undefined {
  const valid = dates
    .map((d) => (typeof d === "string" ? new Date(d) : d))
    .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()));
  if (valid.length === 0) return undefined;
  return new Date(Math.max(...valid.map((d) => d.getTime())));
}
