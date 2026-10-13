"use client";

import { Check } from "lucide-react";
import { HAZARDS, sortHazards } from "@/lib/data/hazards";
import { HAZARD_ICONS } from "@/components/plan/icons";
import { FieldError } from "@/components/ui/field";
import { HAZARD_IDS, type HazardId } from "@/lib/schema";
import { cn } from "@/lib/utils";
import type { StepProps } from "../setup-wizard";

export function HazardsStep({ profile, setProfile, errors }: StepProps) {
  const selected = new Set(profile.hazards);
  const toggle = (id: HazardId) =>
    setProfile((p) => {
      const set = new Set(p.hazards);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...p, hazards: sortHazards([...set]) };
    });
  const allSelected = selected.size === HAZARD_IDS.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl leading-relaxed text-navy-600">
          Select every hazard you want your plan to cover. This doesn&apos;t mean an emergency is expected — it shapes
          which preparation steps you&apos;ll see.
        </p>
        <button
          type="button"
          onClick={() => setProfile((p) => ({ ...p, hazards: allSelected ? [] : [...HAZARD_IDS] }))}
          className="shrink-0 self-start rounded-lg px-2 py-1 text-sm font-semibold text-navy underline-offset-4 hover:underline sm:self-auto"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <fieldset>
        <legend className="sr-only">Hazards to prepare for</legend>
        <div className="grid gap-3 sm:grid-cols-2" data-error-anchor={errors.hazards ? true : undefined} tabIndex={errors.hazards ? -1 : undefined}>
          {HAZARDS.map((h) => {
            const Icon = HAZARD_ICONS[h.id];
            const checked = selected.has(h.id);
            return (
              <label
                key={h.id}
                className={cn(
                  "group relative flex cursor-pointer items-start gap-4 rounded-2xl border bg-white p-4 shadow-card transition-all duration-150 sm:p-5",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy",
                  checked ? "border-navy ring-1 ring-navy" : "border-line hover:border-navy-600/40",
                )}
              >
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(h.id)} />
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    checked ? "bg-navy text-gold" : "bg-paper text-navy-600",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-navy">{h.label}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{h.description}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all",
                    checked ? "border-forest bg-forest text-white" : "border-line-strong",
                  )}
                >
                  {checked ? <Check className="size-3" strokeWidth={3.5} /> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <FieldError message={errors.hazards} />
      <p className="text-[13px] text-muted" aria-live="polite">
        {selected.size === 0 ? "No hazards selected yet." : `${selected.size} of ${HAZARDS.length} selected.`} Not sure
        which apply? Your local emergency-management agency publishes the hazards that affect your area.
      </p>
    </div>
  );
}
