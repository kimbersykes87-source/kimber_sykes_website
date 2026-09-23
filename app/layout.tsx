import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { DEFAULT_OG_IMAGE, HOME_DESCRIPTION, HOME_TITLE } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  icons: { icon: "/favicon.svg" },
  title: {
    default: HOME_TITLE,
    template: "%s | Kimber Sykes",
  },
  description: HOME_DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Kimber Sykes",
    images: [{ url: DEFAULT_OG_IMAGE, alt: "Kimber Sykes — Executive Producer" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    types: {
      "text/plain": [{ url: "/llms.txt", title: "LLM site summary" }],
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">
        <Header />
        <main id="main" className="pt-14 sm:pt-16">
          {children}
        </main>
        <Footer />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
