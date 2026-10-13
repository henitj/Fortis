import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { RESOURCES } from "@/lib/data/resources";

const OFFICIAL = [RESOURCES["ready-home"], RESOURCES["nws-safety"], RESOURCES["fema-home"], RESOURCES["ready-plan"], RESOURCES["ready-kit"]];

export function SiteFooter() {
  return (
    <footer className="bg-navy text-paper print:hidden">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo tone="dark" showTagline />
            <p className="mt-5 text-sm leading-relaxed text-paper/70">
              FORTIS turns general preparedness guidance into a clear, personalized plan for your household — built with
              transparent rules and stored only in your browser.
            </p>
            <Link href="/setup" className="mt-5 inline-flex text-sm font-semibold text-gold underline-offset-4 hover:underline">
              Build your plan →
            </Link>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/50">Official resources</h2>
            <ul className="mt-4 space-y-2.5">
              {OFFICIAL.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    {r.id === "ready-home" || r.id === "fema-home" ? r.title : `${r.publisher}: ${r.title}`}
                    <ExternalLink className="size-3 opacity-50 group-hover:opacity-100" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/50">Privacy</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                No accounts, no analytics, no tracking. Your plan is saved in this browser&apos;s local storage and never
                sent to a server.
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/50">Safety</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                FORTIS provides general planning guidance only. Always follow instructions from local officials. In an
                emergency, call your local emergency number.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>FORTIS — Strength Through Preparation.</p>
          <p>Not affiliated with FEMA, the National Weather Service or any government agency.</p>
        </div>
      </div>
    </footer>
  );
}
