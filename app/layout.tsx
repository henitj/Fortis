import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FORTIS — Strength Through Preparation",
    template: "%s | FORTIS",
  },
  description:
    "Build a private, personalized emergency preparedness plan for your household. Calculate supplies, track priorities, and print a copy—no account or AI service required.",
  applicationName: "FORTIS",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
