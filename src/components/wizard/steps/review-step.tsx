"use client";

import { useMemo } from "react";
import { ListChecks, Package, Pencil, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HAZARD_ICONS } from "@/components/plan/icons";
import { getHazard } from "@/lib/data/hazards";
import { describeLocation } from "@/lib/data/locations";
import { generateTasks } from "@/lib/engine/tasks";
import { calculateWater, DEFAULT_SUPPLY_SETTINGS, generateSupplies } from "@/lib/engine/supplies";
import { FieldError } from "@/components/ui/field";
import { pluralize } from "@/lib/utils";
import type { StepProps } from "../setup-wizard";

const TRI_LABEL = { yes: "Yes", no: "No", unspecified: "Not specified" } as const;

export function ReviewStep({ profile, errors, onEdit, editing }: StepProps & { onEdit: (step: number) => void; editing: boolean }) {
  const { location: l, household: h, preferences: p } = profile;
  const summary = useMemo(() => {
    const settings = { ...DEFAULT_SUPPLY_SETTINGS, hotWeatherBuffer: profile.hazards.includes("extreme-heat") };
    return {
      tasks: generateTasks(profile),
      supplies: generateSupplies(profile, settings),
      water: calculateWater(profile, settings),
    };
  }, [profile]);
  const critical = summary.tasks.filter((t) => t.effectivePriority === "critical").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={ListChecks} value={summary.tasks.length} label="preparedness tasks" sub={`${critical} critical`} />
        <Stat icon={Package} value={summary.supplies.length} label="supply items" sub={`for ${pluralize(p.durationDays, "day")}`} />
        <Stat icon={Package} value={summary.water.totalGallons} label="gallons of water" sub={summary.water.pets ? "incl. pet estimate" : "baseline"} />
      </div>

      <Card>
        <CardContent className="divide-y divide-line py-2 sm:py-2">
          <Row title="Location" onEdit={() => onEdit(0)}>
            {describeLocation(l.country, l.region, l.locality)}
          </Row>
          <Row title="Household" onEdit={() => onEdit(1)}>
            <span>
              {pluralize(h.adults, "adult")}
              {h.olderAdults ? ` (${h.olderAdults} older ${h.olderAdults === 1 ? "adult" : "adults"} needing assistance)` : ""} ·{" "}
              {pluralize(h.children, "child", "children")} · {pluralize(h.pets, "pet")}
            </span>
            <span className="mt-1 block text-[13px] text-muted">
              Mobility needs: {TRI_LABEL[h.mobilityNeeds]} · Powered medical equipment: {TRI_LABEL[h.poweredMedical]} · Communication
              assistance: {TRI_LABEL[h.communicationNeeds]}
            </span>
          </Row>
          <Row title="Hazards" onEdit={() => onEdit(2)}>
            <span className="flex flex-wrap gap-1.5">
              {profile.hazards.map((id) => {
                const Icon = HAZARD_ICONS[id];
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-md bg-paper px-2 py-1 text-[13px] font-medium">
                    <Icon className="size-3.5" aria-hidden />
                    {getHazard(id).label}
                  </span>
                );
              })}
            </span>
          </Row>
          <Row title="Preferences" onEdit={() => onEdit(3)}>
            {p.durationDays}-day plan · Vehicle: {p.hasVehicle === "yes" ? "Yes" : "No"} · Evacuation help:{" "}
            {p.evacuationAssistance === "yes" ? "Yes" : p.evacuationAssistance === "no" ? "No" : "Not sure"} ·{" "}
            {p.detailLevel === "concise" ? "Concise" : "Detailed"}
          </Row>
        </CardContent>
      </Card>
      <FieldError message={Object.values(errors)[0]} />

      <p className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
        <RefreshCcw className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {editing
          ? "Updating regenerates your recommendations. Tasks you've completed, supply quantities and contacts are kept."
          : "Your plan is generated instantly on this device by FORTIS's rules engine — the same answers always produce the same plan."}
      </p>
    </div>
  );
}

function Stat({ icon: Icon, value, label, sub }: { icon: typeof ListChecks; value: number; label: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <Icon className="size-4 text-gold-600" aria-hidden />
      <p className="mt-2 text-2xl font-bold tracking-tight text-navy tabular-nums">{value.toLocaleString("en-US")}</p>
      <p className="text-[13px] font-medium text-navy-600">{label}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

function Row({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{title}</p>
        <div className="mt-1.5 text-[15px] leading-relaxed text-navy">{children}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-navy hover:bg-navy/5"
        aria-label={`Edit ${title.toLowerCase()}`}
      >
        <Pencil className="size-3.5" aria-hidden /> Edit
      </button>
    </div>
  );
}
