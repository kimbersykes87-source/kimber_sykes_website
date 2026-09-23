function envPortfolioUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_PORTFOLIO_PDF_URL;
  return typeof u === "string" && u.trim() !== "" ? u.trim() : undefined;
}

/** URL-encoded path to the large portfolio PDF in `public/` (local dev only when not using an external URL). */
export const PORTFOLIO_PDF_PATH = "/Kimber%20Sykes%20-%20Professional%20Portfolio%20-%202026.pdf";

/** R2 + assets worker (see workers/assets/). */
export const PORTFOLIO_PDF_ASSETS_URL =
  "https://assets.kimbersykes.com/portfolio/kimber-sykes-professional-portfolio-2026.pdf";

function productionAssetsPortfolioUrl(): string | null {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (site.includes("kimbersykes.com")) return PORTFOLIO_PDF_ASSETS_URL;
  return null;
}

/**
 * Production static builds omit the portfolio PDF from the Pages bundle (>25 MiB). Uses
 * NEXT_PUBLIC_PORTFOLIO_PDF_URL, else assets.kimbersykes.com when the canonical site URL is kimbersykes.com.
 */
export function getPortfolioPdfHref(): string | null {
  const external = envPortfolioUrl();
  if (external) return external;
  if (process.env.NODE_ENV === "production") return productionAssetsPortfolioUrl();
  return PORTFOLIO_PDF_PATH;
}
