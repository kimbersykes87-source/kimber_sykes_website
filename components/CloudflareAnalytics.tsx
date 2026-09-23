import Script from "next/script";

/**
 * Cloudflare Web Analytics (cookieless). Set NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN from the dashboard snippet.
 * @see https://developers.cloudflare.com/web-analytics/get-started/
 */
export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;
  if (!token) return null;

  return (
    <Script
      id="cf-web-analytics"
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
