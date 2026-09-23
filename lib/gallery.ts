import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";

function isNumberedJpg(fileName: string): boolean {
  // Accept: 01.jpg, 1.jpg, 001.jpg (case-insensitive extension)
  return /^\d+\.jpe?g$/i.test(fileName);
}

function numericPrefix(fileName: string): number {
  const m = fileName.match(/^(\d+)\./);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

/**
 * Returns `/images/work/<slug>/<nn>.jpg` files present on disk, sorted numerically.
 * Excludes `hero.jpg` and any non-numbered files.
 */
export async function getProjectGalleryFromPublic(slug: string): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "images", "work", slug);
  try {
    const files = await readdir(dir);
    return files
      .filter((f) => isNumberedJpg(f))
      .sort((a, b) => numericPrefix(a) - numericPrefix(b) || a.localeCompare(b))
      .map((f) => `/images/work/${slug}/${f}`);
  } catch {
    return [];
  }
}

