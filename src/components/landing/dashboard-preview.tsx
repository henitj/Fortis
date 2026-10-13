import { Check, Droplets, ListChecks, Users } from "lucide-react";
import { ReadinessRing } from "@/components/plan/readiness-ring";
import { PriorityBadge } from "@/components/plan/priority-badge";
import { HAZARD_ICONS } from "@/components/plan/icons";
import { generateTasks } from "@/lib/engine/tasks";
import { computeReadiness } from "@/lib/engine/readiness";
import { calculateWater, DEFAULT_SUPPLY_SETTINGS } from "@/lib/engine/supplies";
import { getHazard } from "@/lib/data/hazards";
import type { Profile } from "@/lib/schema";

/** A real household run through the real engine — the preview is never hardcoded. */
const SAMPLE: Profile = {
  location: { country: "US", region: "", locality: "" },
  household: { adults: 2, children: 1, olderAdults: 0, pets: 1, mobilityNeeds: "no", poweredMedical: "no", communicationNeeds: "no" },
  hazards: ["flooding", "power-outages"],
  preferences: { durationDays: 7, hasVehicle: "yes", evacuationAssistance: "no", detailLevel: "concise" },
};

export function DashboardPreview() {
  const tasks = generateTasks(SAMPLE);
  const done = new Set(["core-water-supply", "core-alerts", "core-first-aid-kit", "core-flashlights", "core-radio", "core-food-supply", "core-charging", "kids-supplies", "core-sanitation", "pets-identification", "core-documents", "core-alarms"]);
  const status = Object.fromEntries([...done].map((id) => [id, "done" as const]));
  const readiness = computeReadiness(tasks.map((t) => t.id), status);
  const next = tasks.filter((t) => !done.has(t.id)).slice(0, 3);
  const water = calculateWater(SAMPLE, DEFAULT_SUPPLY_SETTINGS);

  return (
    <div aria-label="Example FORTIS plan preview" role="img" className="relative">
      <div className="rounded-[1.4rem] border border-line bg-white p-2 shadow-raised">
        {/* window chrome */}
        <div className="flex items-center justify-between px-3 pt-1.5 pb-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-navy/10" />
            <span className="size-2.5 rounded-full bg-navy/10" />
            <span className="size-2.5 rounded-full bg-navy/10" />
          </div>
          <span className="text-[11px] font-medium text-muted">Example plan</span>
        </div>

        <div className="rounded-2xl bg-paper p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-navy-600">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 font-medium shadow-card">
              <Users className="size-3.5" aria-hidden /> 2 adults · 1 child · 1 pet
            </span>
            {SAMPLE.hazards.map((h) => {
              const Icon = HAZARD_ICONS[h];
              return (
                <span key={h} className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 font-medium shadow-card">
                  <Icon className="size-3.5" aria-hidden /> {getHazard(h).label}
                </span>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr]">
            <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-4 sm:flex-col sm:justify-center sm:px-5">
              <ReadinessRing percentage={readiness.percentage} size={104} stroke={9} />
              <div className="sm:text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Checklist completion</p>
                <p className="mt-1 text-sm font-semibold text-navy tabular-nums">
                  {readiness.completed} of {readiness.applicable} tasks
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-navy">
                  <ListChecks className="size-4 text-gold-600" aria-hidden /> Next priorities
                </p>
                <span className="text-[11px] text-muted">{readiness.remaining} remaining</span>
              </div>
              <ul className="mt-3 space-y-2">
                {next.map((t) => (
                  <li key={t.id} className="flex items-start gap-2.5 rounded-lg border border-line px-3 py-2.5">
                    <span aria-hidden className="mt-0.5 size-4 shrink-0 rounded-[5px] border-[1.5px] border-line-strong" />
                    <span className="min-w-0 flex-1 text-[13px] leading-snug font-medium text-navy">{t.title}</span>
                    <PriorityBadge priority={t.effectivePriority} className="hidden sm:inline-flex" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* floating calculation card */}
      <div className="absolute -bottom-6 -left-3 hidden w-60 rounded-xl border border-line bg-white p-3.5 shadow-raised sm:block lg:-left-10">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          <Droplets className="size-3.5 text-forest" aria-hidden /> Water calculation
        </p>
        <p className="mt-1.5 font-mono text-[12px] text-navy-600">
          {water.people} people × {water.days} days × 1 gal
        </p>
        <p className="mt-0.5 text-xl font-bold tracking-tight text-navy tabular-nums">
          {water.householdGallons} gallons
          <span className="ml-1.5 text-xs font-medium text-muted">+ pet estimate</span>
        </p>
      </div>
      <div className="absolute -top-4 -right-3 hidden items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-forest shadow-raised sm:flex lg:-right-6">
        <Check className="size-3.5" strokeWidth={3} aria-hidden /> Saved on this device
      </div>
    </div>
  );
}
