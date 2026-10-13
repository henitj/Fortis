import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/site/toaster";
import { ServiceWorkerRegister } from "@/components/site/service-worker";
import "./globals.css";

const description =
  "FORTIS builds a personalized emergency plan for your household — supplies, priorities and a printable plan — using transparent rules. No account, no AI service, and your data stays in your browser.";

// Vercel provides these automatically; no configuration is required.
const siteHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl = siteHost ? `https://${siteHost}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FORTIS — Strength Through Preparation",
    template: "%s · FORTIS",
  },
  description,
  applicationName: "FORTIS",
  keywords: ["emergency preparedness", "emergency plan", "disaster preparedness", "household plan", "emergency kit"],
  openGraph: {
    title: "FORTIS — Strength Through Preparation",
    description,
    type: "website",
    siteName: "FORTIS",
  },
  twitter: { card: "summary_large_image", title: "FORTIS — Strength Through Preparation", description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#101820",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh font-sans">
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
