/**
 * Serves static files from R2 on assets.kimbersykes.com:
 * - Portfolio PDF (explicit route + Content-Disposition)
 * - Email signature assets under /email-signature/
 */
export interface Env {
  ASSETS: R2Bucket;
}

const PORTFOLIO_PATH = "/portfolio/kimber-sykes-professional-portfolio-2026.pdf";

const PORTFOLIO = {
  key: "portfolio/kimber-sykes-professional-portfolio-2026.pdf",
  contentType: "application/pdf",
  filename: "Kimber Sykes - Professional Portfolio - 2026.pdf",
};

const EMAIL_SIGNATURE_PREFIX = "/email-signature/";

function contentTypeForPath(pathname: string): string {
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function r2KeyFromPathname(pathname: string): string {
  return pathname.replace(/^\//, "");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const pathname = new URL(request.url).pathname;

    if (pathname === PORTFOLIO_PATH) {
      return serveObject(env, PORTFOLIO.key, {
        contentType: PORTFOLIO.contentType,
        contentDisposition: `inline; filename="${PORTFOLIO.filename.replace(/"/g, "")}"`,
        request,
      });
    }

    if (pathname.startsWith(EMAIL_SIGNATURE_PREFIX)) {
      const key = r2KeyFromPathname(pathname);
      if (key.includes("..")) {
        return new Response("Not Found", { status: 404 });
      }
      return serveObject(env, key, {
        contentType: contentTypeForPath(pathname),
        request,
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function serveObject(
  env: Env,
  key: string,
  opts: { contentType: string; contentDisposition?: string; request: Request },
): Promise<Response> {
  const object = await env.ASSETS.get(key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", opts.contentType);
  if (opts.contentDisposition) {
    headers.set("content-disposition", opts.contentDisposition);
  }
  headers.set("cache-control", "public, max-age=86400, immutable");

  return new Response(opts.request.method === "HEAD" ? null : object.body, { headers });
}
