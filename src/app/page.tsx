import Link from "next/link";
import {
  Calculator,
  Check,
  ClipboardList,
  Eye,
  HardDrive,
  ListChecks,
  Lock,
  Printer,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  Users,
  WifiOff,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PlanCta } from "@/components/site/plan-cta";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { buttonVariants } from "@/components/ui/button";
import { HAZARD_ICONS } from "@/components/plan/icons";
import { HAZARDS } from "@/lib/data/hazards";
import { TASKS } from "@/lib/data/tasks";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Personalized Plans",
    body: "Recommendations adapt to who lives in your home — children, older adults, pets, accessibility and medical-equipment needs — and the hazards you choose.",
  },
  {
    icon: Calculator,
    title: "Smart Supply Planning",
    body: "Calculate water, food and essential supplies for 3, 7 or 14 days. Every quantity shows its formula, and you can adjust any of them.",
  },
  {
    icon: ListChecks,
    title: "Clear Priorities",
    body: "See the most important unfinished actions first, with a short explanation of why each one is in your plan.",
  },
  {
    icon: WifiOff,
    title: "Ready Offline",
    body: "After your first visit, FORTIS opens without an internet connection and your plan is saved in your browser. Print it or save a PDF for a copy that never needs a battery.",
  },
];

const STEPS = [
  { title: "Tell us about your household", body: "Who lives with you, any pets, and needs like mobility support or powered medical equipment." },
  { title: "Choose the emergencies you want to prepare for", body: "Pick from storms, floods, wildfires, heat, cold, power outages, earthquakes and hurricanes." },
  { title: "Get your personalized action plan", body: "A prioritized checklist, a supply calculator, a communication plan and a printable copy." },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* ───────── Hero ───────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgb(16_24_32/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(16_24_32/0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,black,transparent)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-10 pb-20 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:pt-16 lg:pb-28">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-[12px] font-semibold text-navy-600 shadow-card">
                <ShieldCheck className="size-3.5 text-forest" aria-hidden />
                Personalized emergency preparedness
              </p>
              <h1 className="mt-6 text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance text-navy sm:text-6xl lg:text-[4.1rem]">
                Prepared for the unexpected. <span className="text-navy-600/80">Ready for what matters.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-navy-600">
                Build a personalized emergency plan for your household. Know what to prepare, what to prioritize, and
                what to do next.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PlanCta size="lg" />
                <Link href="#features" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                  Explore Features
                </Link>
              </div>
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-navy-600 sm:flex sm:flex-wrap">
                {["No account needed", "No AI service", "Data stays on your device", "Printable plan"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-forest" strokeWidth={2.5} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-rise [animation-delay:120ms] lg:pl-4">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* ───────── Problem ───────── */}
        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.4fr] md:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">The problem</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-navy sm:text-4xl">
                Guidance is everywhere. A plan for your household isn&apos;t.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3 md:gap-5">
              {[
                { icon: ClipboardList, title: "Generic lists", body: "Official checklists have to serve everyone, so they can't tell you what your household needs first." },
                { icon: Users, title: "Needs differ", body: "Infants, older relatives, pets and medical equipment all change what you should do and in what order." },
                { icon: TriangleAlert, title: "Easy to put off", body: "Long lists feel overwhelming. Without clear next steps, preparation slips down the to-do list." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <Icon className="size-5 text-navy" aria-hidden />
                  <h3 className="mt-3 font-semibold text-navy">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Features ───────── */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance text-navy sm:text-4xl">
              Everything your household plan needs, in one place.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-navy-600">
              FORTIS combines a rules engine, a supply calculator and a communication planner into a plan you can act on
              today.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group rounded-2xl border border-line bg-white p-6 shadow-card transition-shadow hover:shadow-raised sm:p-7">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-navy text-gold">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold text-navy">Prepare for the hazards that matter to you</h3>
                <p className="mt-1 text-sm text-muted">
                  {TASKS.length} preparedness actions, each included only when it applies to your household.
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {HAZARDS.map((h) => {
                  const Icon = HAZARD_ICONS[h.id];
                  return (
                    <li key={h.id} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13px] font-medium text-navy">
                      <Icon className="size-3.5 text-navy-600" aria-hidden />
                      {h.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ───────── How it works ───────── */}
        <section id="how-it-works" className="border-y border-line bg-paper-dark/50">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">How it works</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Three steps. About five minutes.</h2>
              </div>
              <PlanCta variant="secondary" />
            </div>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
                  <span className="text-sm font-bold tabular-nums text-gold-600">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-navy">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────── Methodology / Trust ───────── */}
        <section id="methodology" className="bg-navy text-paper">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Methodology</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">Transparent by design.</h2>
              <p className="mt-4 text-lg leading-relaxed text-paper/70">
                FORTIS doesn&apos;t guess. Every recommendation comes from a published rule, and every number shows its
                math.
              </p>
              <ul className="mt-10 space-y-6">
                {[
                  { icon: ClipboardList, title: "Predefined preparedness rules", body: "Plans are generated from a version-controlled library of tasks based on guidance from Ready.gov, FEMA and the National Weather Service." },
                  { icon: ShieldCheck, title: "No AI service required", body: "The same answers always produce the same plan. Nothing is sent to an AI model or external API." },
                  { icon: HardDrive, title: "Your data stays in your browser", body: "Plans are stored in local storage on your device. There are no accounts and no analytics." },
                  { icon: Eye, title: "Visible calculations and assumptions", body: "Water, food and supply quantities show the formula used. Each task explains why it's in your plan." },
                  { icon: TriangleAlert, title: "Not a substitute for official instructions", body: "General planning can't replace current guidance. During an emergency, follow local officials and evacuate when told." },
                ].map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-gold">
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-paper/65">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 lg:pt-14">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/50">Example rule</p>
                <pre className="mt-4 overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-paper/85">
                  <span className="text-gold">IF</span> hazards include <span className="text-[#9fd0b4]">flooding</span> or{" "}
                  <span className="text-[#9fd0b4]">hurricanes</span>
                  {"\n"}
                  <span className="text-gold">THEN</span> add &ldquo;Identify your local flood risk&rdquo;
                  {"\n"}
                  <span className="text-paper/45">     priority: critical · ref: ready.gov/floods</span>
                </pre>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/50">Example calculation</p>
                <div className="mt-4 font-mono text-[13px] leading-relaxed text-paper/85">
                  <p>people = adults + children</p>
                  <p>water = people × days × 1 gallon</p>
                  <p className="mt-3 text-paper">
                    3 × 7 × 1 = <span className="font-semibold text-gold">21 gallons</span>
                  </p>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-paper/55">
                  Pets are calculated separately with an adjustable estimate. Heat, illness, activity and pregnancy can
                  increase needs.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/50">Readiness score</p>
                <p className="mt-4 font-mono text-[13px] text-paper/85">completed ÷ applicable tasks × 100</p>
                <p className="mt-3 text-[13px] leading-relaxed text-paper/55">
                  It measures checklist completion — not safety — and never predicts emergency outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Final CTA ───────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
          <div className="flex flex-col items-start gap-8 rounded-3xl border border-line bg-white p-8 shadow-card sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-balance text-navy">Start your plan today.</h2>
              <p className="mt-3 leading-relaxed text-muted">
                It takes about five minutes. No sign-up, nothing to install, and you can print it when you&apos;re done.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PlanCta size="lg" />
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <Lock className="size-4" aria-hidden /> Private by default
                <Printer className="ml-2 size-4" aria-hidden /> Printable
              </span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
