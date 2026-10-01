import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/** Reads pixel dimensions of a JPEG or PNG in /public at build time. Returns null if unknown. */
export function publicImageSize(src: string): { width: number; height: number } | null {
  try {
    const buf = readFileSync(path.join(process.cwd(), "public", decodeURIComponent(src)));
    // PNG: IHDR width/height at bytes 16..23
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    // JPEG: walk markers until a Start Of Frame segment
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
        if (isSof) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        i += 2 + len;
      }
    }
  } catch {
    // fall through
  }
  return null;
}
