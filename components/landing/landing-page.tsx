import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ClipboardCheck,
  FileText,
  Fingerprint,
  HeartHandshake,
  LockKeyhole,
  Map,
  Menu,
  Printer,
  ShieldCheck,
  SlidersHorizontal,
  SquareCheckBig,
  Waves,
} from "lucide-react";
import { FortisLogo } from "@/components/branding/fortis-logo";
import { buttonStyles } from "@/components/ui/button";
import { DISCLAIMER, OFFICIAL_RESOURCES } from "@/lib/official-resources";
import { getRecommendations, getPriorityTasks } from "@/lib/rules-engine";
import { getSupplyMath } from "@/lib/supply-calculations";
import type { HouseholdProfile } from "@/lib/types";

const sampleProfile: HouseholdProfile = {
  location: { country: "", region: "", locality: "" },
  household: {
    adults: 2,
    children: 0,
    olderAdults: 0,
    pets: 1,
    accessibility: false,
    poweredMedical: false,
    communicationSupport: false,
  },
  hazards: ["storms", "outages"],
  preferences: {
    days: 3,
    vehicle: true,
    evacuationAssistance: false,
    detail: "concise",
  },
};
const previewTasks = getRecommendations(sampleProfile);
const previewPriority = getPriorityTasks(previewTasks, {}, 3);
const previewMath = getSupplyMath(sampleProfile);

const features = [
  {
    icon: SlidersHorizontal,
    number: "01",
    title: "Personalized plans",
    text: "Recommendations adapt to your household, your planning horizon, and the hazards you choose.",
  },
  {
    icon: Waves,
    number: "02",
    title: "Smart supply planning",
    text: "See exactly how water, food, and essentials add up—and adjust each target to fit your needs.",
  },
  {
    icon: SquareCheckBig,
    number: "03",
    title: "Clear priorities",
    text: "Turn a big, abstract task into the next practical action. Your progress stays visible.",
  },
  {
    icon: Printer,
    number: "04",
    title: "Ready offline",
    text: "Once loaded, planning needs no network calls. Keep it in this browser and print a copy to take with you.",
  },
];

export function LandingPage() {
  return (
    <>
      <div className="relative overflow-hidden bg-ink text-white">
        <div
          className="hero-grid pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <header className="relative z-10 border-b border-white/10">
          <nav
            className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              aria-label="FORTIS home"
              className="rounded-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <FortisLogo light />
            </Link>
            <div className="hidden items-center gap-9 md:flex">
              <a
                href="#features"
                className="text-sm text-white/75 transition hover:text-white"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-white/75 transition hover:text-white"
              >
                How it works
              </a>
              <a
                href="#our-approach"
                className="text-sm text-white/75 transition hover:text-white"
              >
                Our approach
              </a>
            </div>
            <div className="hidden md:block">
              <Link href="/plan" className={buttonStyles("primary", "small")}>
                Build My Plan <ArrowRight size={16} />
              </Link>
            </div>
            <details className="mobile-menu relative md:hidden">
              <summary
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-white/25 text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-gold"
                aria-label="Open navigation menu"
              >
                <Menu size={21} />
              </summary>
              <div className="absolute right-0 top-14 z-50 flex w-56 flex-col gap-1 rounded-xl border border-white/15 bg-[#1b2934] p-3 shadow-xl">
                <a
                  href="#features"
                  className="rounded-lg px-3 py-3 text-sm hover:bg-white/10"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-lg px-3 py-3 text-sm hover:bg-white/10"
                >
                  How it works
                </a>
                <a
                  href="#our-approach"
                  className="rounded-lg px-3 py-3 text-sm hover:bg-white/10"
                >
                  Our approach
                </a>
                <Link
                  href="/plan"
                  className={`${buttonStyles("primary", "small")} mt-1`}
                >
                  Build My Plan
                </Link>
              </div>
            </details>
          </nav>
        </header>

        <main>
          <section
            className="relative mx-auto grid max-w-[1320px] items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 lg:px-12 lg:pb-32 lg:pt-28"
            aria-labelledby="hero-title"
          >
            <div className="relative z-10 max-w-[680px]">
              <div className="mb-7 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Strength
                through preparation
              </div>
              <h1
                id="hero-title"
                className="font-display text-[clamp(2.8rem,5.3vw,5.6rem)] font-extrabold leading-[1.065] tracking-[-0.065em]"
              >
                Prepared for the unexpected.{" "}
                <span className="text-gold">Ready for what matters.</span>
              </h1>
              <p className="mt-7 max-w-[580px] text-[17px] leading-[1.8] text-[#c8d0d3] sm:text-lg">
                Build a personalized emergency plan for your household. Know
                what to prepare, what to prioritize, and what to do next.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/plan" className={buttonStyles("primary")}>
                  Build My Plan <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Explore Features <ArrowDownRight size={17} />
                </a>
              </div>
              <p className="mt-8 flex items-center gap-2 text-xs font-medium tracking-wide text-[#acb8bb]">
                <LockKeyhole size={15} className="text-gold" /> No account. No
                AI API. Your plan stays in your browser.
              </p>
            </div>
            <div className="relative z-10 lg:pl-2">
              <DashboardPreview />
            </div>
          </section>
        </main>
      </div>

      <div className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-[1320px] gap-4 px-5 py-5 text-xs font-bold uppercase tracking-[0.14em] text-forest sm:grid-cols-3 sm:px-8 lg:px-12">
          <span className="flex items-center gap-2.5">
            <ShieldCheck size={17} strokeWidth={1.8} /> Rules you can understand
          </span>
          <span className="flex items-center gap-2.5">
            <LockKeyhole size={17} strokeWidth={1.8} /> Private by design
          </span>
          <span className="flex items-center gap-2.5">
            <FileText size={17} strokeWidth={1.8} /> Practical on paper
          </span>
        </div>
      </div>

      <section
        id="features"
        className="mx-auto max-w-[1320px] scroll-mt-10 px-5 py-22 sm:px-8 lg:px-12 lg:py-28"
        aria-labelledby="features-title"
      >
        <div className="mb-12 grid gap-4 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <Eyebrow>What FORTIS does</Eyebrow>
            <h2 id="features-title" className="section-title mt-4">
              A plan that fits your life.
              <br />
              <span className="text-slate">Not a one-size-fits-all list.</span>
            </h2>
          </div>
          <p className="max-w-[450px] text-[15px] leading-7 text-slate lg:justify-self-end">
            Less searching, less guessing. FORTIS turns preparedness guidance
            into a clear starting point you can actually use.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, number, title, text }) => (
            <article
              key={title}
              className="group flex min-h-[265px] flex-col rounded-[22px] border border-line bg-white p-6 transition-colors hover:border-[#aebcb7] sm:p-7"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff3ef] text-forest">
                  <Icon size={23} strokeWidth={1.8} />
                </span>
                <span className="text-xs font-bold tracking-[0.15em] text-[#a3adb0]">
                  {number}
                </span>
              </div>
              <h3 className="font-display mt-9 text-[19px] font-bold tracking-[-0.03em] text-ink">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-[1.7] text-slate">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-6 border-y border-line bg-white py-22 lg:py-28"
        aria-labelledby="how-title"
      >
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>A simpler way forward</Eyebrow>
              <h2 id="how-title" className="section-title mt-4">
                Three steps to a clearer plan.
              </h2>
            </div>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 text-sm font-bold text-forest underline decoration-[#c5d2c9] underline-offset-6 hover:decoration-forest"
            >
              Start yours <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              {
                number: "01",
                icon: HeartHandshake,
                title: "Tell us about your household",
                text: "Add only what matters: people, pets, support needs, and an optional location.",
              },
              {
                number: "02",
                icon: Map,
                title: "Choose what to prepare for",
                text: "Select the hazards on your mind. No predictions, no location tracking.",
              },
              {
                number: "03",
                icon: ClipboardCheck,
                title: "Get your action plan",
                text: "See relevant tasks, transparent quantities, and a printable communication plan.",
              },
            ].map(({ number, icon: Icon, title, text }) => (
              <div key={number} className="border-t-2 border-forest/20 pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[44px] font-extrabold tracking-[-0.06em] text-[#c7d3ca]">
                    {number}
                  </span>
                  <Icon size={24} strokeWidth={1.7} className="text-forest" />
                </div>
                <h3 className="font-display mt-5 text-xl font-bold tracking-[-0.035em]">
                  {title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="our-approach"
        className="mx-auto max-w-[1320px] scroll-mt-6 px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
        aria-labelledby="approach-title"
      >
        <div className="grid overflow-hidden rounded-[28px] bg-forest text-white lg:grid-cols-[0.93fr_1.07fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7c184]">
              The FORTIS approach
            </span>
            <h2
              id="approach-title"
              className="font-display mt-6 max-w-sm text-[clamp(2.1rem,3.8vw,3.5rem)] font-extrabold leading-[1.14] tracking-[-0.055em]"
            >
              Trust is built into the plan.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#d0ddd4]">
              Good preparation starts with clear assumptions, not black-box
              answers. See exactly why a recommendation appears and change what
              you need.
            </p>
            <Link href="/plan" className={`${buttonStyles("primary")} mt-9`}>
              Build My Plan <ArrowRight size={17} />
            </Link>
          </div>
          <div className="border-t border-white/15 bg-[#2e5a46] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-16">
            <ul className="space-y-5">
              {[
                "Recommendations come from predefined, version-controlled preparedness rules.",
                "No AI service, login, database, or paid API is required.",
                "Personal plan details stay in your browser's local storage.",
                "Water, food, and readiness calculations show their assumptions.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-7 text-white"
                >
                  <Check
                    className="mt-1 shrink-0 text-[#e4bf70]"
                    size={18}
                    strokeWidth={2.4}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-9 border-t border-white/20 pt-7 text-sm leading-7 text-[#d5e0d9]">
              General planning is not a substitute for current instructions from
              local authorities. Review and update your plan periodically.
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-ink text-white">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 pb-12 pt-16 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.9fr] lg:px-12">
          <div>
            <Link href="/" aria-label="FORTIS home" className="inline-block">
              <FortisLogo light />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#b9c3c5]">
              Strength Through Preparation. Personalized emergency planning for
              the people and needs that matter most.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.17em] text-gold">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[#c8d0d1]">
              <li>
                <Link href="/plan" className="hover:text-white">
                  Build or open your plan
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#our-approach" className="hover:text-white">
                  Our approach
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.17em] text-gold">
              Official guidance
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-[#c8d0d1]">
              {OFFICIAL_RESOURCES.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-white"
                  >
                    {resource.name}{" "}
                    <ArrowDownRight size={13} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-[1320px] border-t border-white/15 px-5 py-7 text-xs leading-6 text-[#aab7bb] sm:px-8 lg:px-12">
          <p>
            <span className="font-semibold text-white">Privacy:</span>{" "}
            Information you enter is saved only in this browser. Clearing site
            data or losing the device can remove it; print a backup.
          </p>
          <p className="mt-2">{DISCLAIMER}</p>
          <p className="mt-5 text-[#89999d]">
            © {new Date().getFullYear()} FORTIS. An independent preparedness
            planning tool; not a government service.
          </p>
        </div>
      </footer>
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-forest">
      {children}
    </span>
  );
}

function DashboardPreview() {
  return (
    <div
      className="relative mx-auto max-w-[540px] lg:ml-auto"
      aria-label="Illustrative dashboard preview for a sample household"
    >
      <div
        className="absolute -inset-3 rounded-[30px] border border-white/10 sm:-inset-5"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-[22px] border border-[#c9d0cb] bg-[#f7f7f4] text-ink shadow-[0_30px_80px_rgba(0,0,0,.23)]">
        <div className="flex items-center justify-between border-b border-[#e5e8e4] bg-white px-5 py-4 sm:px-7">
          <FortisLogo compact />
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" /> Sample
            preview
          </span>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-forest">
                Household plan
              </p>
              <h2 className="font-display mt-1 text-xl font-extrabold tracking-[-0.04em] sm:text-2xl">
                A clearer path to ready.
              </h2>
              <p className="mt-2 text-xs text-slate">
                2 people · 1 pet · 3-day plan
              </p>
            </div>
            <div className="rounded-lg bg-[#e6eee8] p-2.5 text-forest">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-ink p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b7c6c3]">
                  Preparedness checklist
                </p>
                <p className="font-display mt-1 text-[32px] font-extrabold leading-none tracking-[-0.05em]">
                  0<span className="text-lg text-gold">%</span>
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/80">
                0 of {previewTasks.length} done
              </span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-white/15">
              <div className="h-full w-0 rounded-full bg-gold" />
            </div>
            <p className="mt-2 text-[10px] text-[#bac8c8]">
              Example inputs. No progress has been recorded.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-white p-3 sm:p-4">
              <p className="text-[10px] font-semibold text-slate">
                People&apos;s water baseline
              </p>
              <p className="font-display mt-1 text-xl font-extrabold">
                {previewMath.baselineWaterGallons}{" "}
                <span className="text-xs font-medium text-slate">gal</span>
              </p>
              <p className="mt-1 text-[10px] text-slate">2 people × 3 days</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-3 sm:p-4">
              <p className="text-[10px] font-semibold text-slate">
                Meal-planning count
              </p>
              <p className="font-display mt-1 text-xl font-extrabold">
                {previewMath.suggestedMeals}{" "}
                <span className="text-xs font-medium text-slate">meals</span>
              </p>
              <p className="mt-1 text-[10px] text-slate">6 person-days × 3</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold">First actions</h3>
              <span className="text-[10px] text-slate">
                Based on sample inputs
              </span>
            </div>
            <div className="mt-3 space-y-0.5">
              {previewPriority.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 border-t border-line py-2.5 first:border-t-0"
                >
                  <span className="h-4 w-4 shrink-0 rounded-[5px] border-[1.5px] border-[#9daca9]" />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink">
                    {task.title}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-forest">
                    {task.priority === "essential" ? "Essential" : "Important"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-[#e0e6e1] bg-white px-4 py-3 text-xs font-semibold text-forest shadow-lg sm:flex lg:-left-10">
        <Fingerprint size={18} strokeWidth={1.8} /> Local-first, by design
      </div>
    </div>
  );
}
