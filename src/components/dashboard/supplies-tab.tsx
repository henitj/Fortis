"use client";

import * as React from "react";
import { Droplets, HeartPulse, Plug, RotateCcw, ThermometerSun, Utensils, PawPrint } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Badge } from "@/components/ui/badge";
import { setSupplyOnHand, setSupplySettings, setSupplyTarget } from "@/lib/client/plan-store";
import {
  formatNumber,
  gallonsToLiters,
  HOT_WEATHER_MULTIPLIER,
  MEALS_PER_PERSON_PER_DAY,
  SUPPLY_CATEGORIES,
  type ResolvedSupply,
} from "@/lib/engine/supplies";
import { getResource } from "@/lib/data/resources";
import { cn, pluralize } from "@/lib/utils";
import { Notice, ResourceLink, SectionHeader } from "./shared";
import type { PlanView } from "./use-plan-view";

const PET_WATER_PRESETS = [0.125, 0.25, 0.5, 1];

export function SuppliesTab({ view }: { view: PlanView }) {
  const { water, food, supplies, supplySummary: summary, plan } = view;
  const settings = plan.supplies.settings;
  const h = plan.profile.household;
  const [hideAvailable, setHideAvailable] = React.useState(false);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Supply calculator"
        description={`Quantities for ${pluralize(water.people, "person", "people")}${h.pets ? ` and ${pluralize(h.pets, "pet")}` : ""} over ${water.days} days. Every quantity shows how it was calculated, and you can adjust any of them.`}
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStat label="Supplies planned" value={summary.planned} />
        <SummaryStat label="Marked available" value={summary.available} tone="text-forest" />
        <SummaryStat label="Still needed" value={summary.needed} tone={summary.needed ? "text-warn" : "text-forest"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Water */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="size-5 text-forest" aria-hidden /> Water
            </CardTitle>
            <CardDescription>
              At least one gallon per person per day for drinking and basic sanitation — a general preparedness starting
              point.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-navy p-5 text-paper">
              <dl className="space-y-2.5 font-mono text-[13px]">
                <FormulaRow label="people = adults + children" value={`${h.adults} + ${h.children} = ${water.people}`} />
                <FormulaRow
                  label="household = people × days × 1 gal"
                  value={`${water.people} × ${water.days} × ${water.gallonsPerPersonPerDay} = ${water.baselineGallons} gal`}
                />
                {water.multiplier > 1 ? (
                  <FormulaRow label="hot-weather buffer" value={`× ${water.multiplier} = ${water.householdGallons} gal`} />
                ) : null}
                {water.pets > 0 ? (
                  <FormulaRow
                    label="pets (estimate)"
                    value={`${water.pets} × ${water.days} × ${formatNumber(water.petGallonsPerDay, 3)} = ${formatNumber(water.petGallons)} gal`}
                  />
                ) : null}
              </dl>
              <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-paper/60">Total water</span>
                <span className="text-right">
                  <span className="block text-3xl font-bold tracking-tight text-gold tabular-nums">{formatNumber(water.totalGallons)} gal</span>
                  <span className="text-xs text-paper/60">≈ {formatNumber(gallonsToLiters(water.totalGallons), 1)} liters</span>
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-line p-4">
              <div className="flex gap-3">
                <ThermometerSun className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
                <div>
                  <p id="hot-weather-label" className="text-sm font-semibold text-navy">
                    Hot-weather buffer (× {HOT_WEATHER_MULTIPLIER})
                  </p>
                  <p id="hot-weather-desc" className="mt-0.5 text-[13px] leading-relaxed text-muted">
                    Ready.gov notes water needs can double in very hot temperatures.
                    {plan.profile.hazards.includes("extreme-heat") ? " Suggested because your plan includes extreme heat." : null}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.hotWeatherBuffer}
                onCheckedChange={(hotWeatherBuffer) => setSupplySettings({ hotWeatherBuffer })}
                aria-label="Hot-weather buffer"
                aria-describedby="hot-weather-desc"
              />
            </div>

            {water.pets > 0 ? (
              <div className="rounded-xl border border-line p-4">
                <div className="flex gap-3">
                  <PawPrint className="mt-0.5 size-4 shrink-0 text-navy-600" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p id="pet-water-label" className="text-sm font-semibold text-navy">
                      Pet water estimate <Badge tone="gold" className="ml-1 align-middle">Estimate</Badge>
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                      Gallons per pet per day. Needs vary by species, size, weather and health — confirm with your
                      veterinarian. Pets are never counted as people.
                    </p>
                    <div role="radiogroup" aria-labelledby="pet-water-label" className="mt-3 flex flex-wrap gap-2">
                      {PET_WATER_PRESETS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          role="radio"
                          aria-checked={settings.petWaterGallonsPerDay === v}
                          onClick={() => setSupplySettings({ petWaterGallonsPerDay: v })}
                          className={cn(
                            "h-9 rounded-lg border px-3 text-sm font-semibold tabular-nums transition-colors",
                            settings.petWaterGallonsPerDay === v
                              ? "border-navy bg-navy text-paper"
                              : "border-line-strong bg-white text-navy hover:border-navy-600/40",
                          )}
                        >
                          {formatNumber(v, 3)} gal
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Assumptions</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-navy-600 marker:text-line-strong">
                <li>Older adults are already counted among adults, so they aren&apos;t added twice.</li>
                <li>Hot weather, illness, physical activity, pregnancy and nursing can increase needs. Children and sick people may need more.</li>
                <li>Store commercially bottled water sealed in a cool, dark place; replace other stored water every six months.</li>
              </ul>
              <ResourceLink resource={getResource("ready-water")} className="mt-3" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Food */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Utensils className="size-5 text-navy-600" aria-hidden /> Food
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-paper/70 p-3.5">
                  <dt className="text-xs font-medium text-muted">Person-days</dt>
                  <dd className="mt-0.5 text-2xl font-bold text-navy tabular-nums">{food.personDays}</dd>
                  <dd className="text-xs text-muted">
                    {food.people} × {food.days} days
                  </dd>
                </div>
                <div className="rounded-xl bg-paper/70 p-3.5">
                  <dt className="text-xs font-medium text-muted">Meals to plan</dt>
                  <dd className="mt-0.5 text-2xl font-bold text-navy tabular-nums">{food.meals}</dd>
                  <dd className="text-xs text-muted">{MEALS_PER_PERSON_PER_DAY} per person per day</dd>
                </div>
              </dl>
              <p className="mt-4 text-[13px] leading-relaxed text-muted">
                A planning quantity, not a nutritional guarantee. Choose non-perishable foods your household will eat, and
                account for infants, special diets and allergies.
              </p>
              <ResourceLink resource={getResource("ready-food")} className="mt-3" />
            </CardContent>
          </Card>

          {/* Progress by category */}
          <Card>
            <CardHeader>
              <CardTitle>Progress by category</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {summary.byCategory.map((c) => (
                  <li key={c.id}>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="font-medium text-navy-600">{c.label}</span>
                      <span className="font-semibold text-navy tabular-nums">
                        {c.available}/{c.planned}
                      </span>
                    </div>
                    <Progress value={c.available} max={c.planned} size="sm" label={`${c.label} supplies available`} tone="navy" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Health reminders */}
      <div className="grid gap-3 md:grid-cols-2">
        <Notice icon={HeartPulse} title="Medications">
          Coordinate with a pharmacist or healthcare professional about maintaining an appropriate emergency supply, and keep a
          written list of medications and dosages.
        </Notice>
        {h.poweredMedical === "yes" ? (
          <Notice icon={Plug} tone="gold" title="Powered medical equipment">
            Consult the equipment provider and your healthcare team about safe backup power, battery life and a continuity plan
            if power is unavailable.
          </Notice>
        ) : null}
      </div>

      {/* Supply list */}
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-navy">Supply checklist</h3>
            <p className="mt-1 text-sm text-muted">
              Record what you already have. Set a target to 0 for anything you don&apos;t need.
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy-600">
            <Switch checked={hideAvailable} onCheckedChange={setHideAvailable} aria-label="Hide available supplies" />
            Hide available
          </label>
        </div>

        <div className="mt-5 space-y-6">
          {SUPPLY_CATEGORIES.map((cat) => {
            const items = supplies.filter((s) => s.category === cat.id && (!hideAvailable || s.status !== "available"));
            if (items.length === 0) return null;
            return (
              <section key={cat.id} aria-labelledby={`sup-${cat.id}`}>
                <h4 id={`sup-${cat.id}`} className="mb-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  {cat.label}
                </h4>
                <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  {items.map((item) => (
                    <SupplyRow key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            );
          })}
          {hideAvailable && supplies.every((s) => s.status === "available" || s.status === "skipped") ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-white/60 px-6 py-10 text-center text-sm text-muted">
              Every planned supply is marked available.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SupplyRow({ item }: { item: ResolvedSupply }) {
  const id = `supply-${item.id}`;
  const available = item.status === "available";
  const skipped = item.status === "skipped";
  return (
    <li className={cn("p-4 transition-colors sm:px-5", available && "bg-forest-100/30", skipped && "bg-paper/50")}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <Checkbox
            id={id}
            size="lg"
            checked={available}
            disabled={skipped}
            className="mt-px"
            aria-describedby={`${id}-formula`}
            onChange={(e) => setSupplyOnHand(item.id, e.target.checked ? item.target : 0)}
          />
          <div className="min-w-0">
            <label htmlFor={id} className={cn("cursor-pointer text-[15px] font-semibold", skipped ? "text-muted line-through" : "text-navy")}>
              {item.name}
            </label>
            <p id={`${id}-formula`} className="mt-0.5 text-[13px] text-muted">
              <span className="font-mono text-[12px]">{item.formula}</span>
              {item.estimate ? <Badge tone="gold" className="ml-2 align-middle">Estimate</Badge> : null}
              {item.isCustomTarget ? (
                <span className="ml-2">
                  · Recommended {item.recommended}{" "}
                  <button
                    type="button"
                    onClick={() => setSupplyTarget(item.id, null)}
                    className="inline-flex items-center gap-1 font-semibold text-navy underline-offset-2 hover:underline"
                  >
                    <RotateCcw className="size-3" aria-hidden /> Reset
                  </button>
                </span>
              ) : null}
            </p>
            {item.note ? <p className="mt-1 text-[12.5px] leading-relaxed text-navy-600">{item.note}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-3 pl-[2.375rem] md:pl-0">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted" aria-hidden>
              Have
            </span>
            <NumberStepper
              id={`${id}-have`}
              label={`${item.name} on hand`}
              value={item.onHand}
              max={9999}
              size="sm"
              onChange={(v) => setSupplyOnHand(item.id, v)}
            />
          </div>
          <span className="mt-5 text-sm text-muted" aria-hidden>
            of
          </span>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted" aria-hidden>
              Target
            </span>
            <NumberStepper
              id={`${id}-target`}
              label={`${item.name} target`}
              value={item.target}
              max={9999}
              size="sm"
              onChange={(v) => setSupplyTarget(item.id, v === item.recommended ? null : v)}
            />
          </div>
          <span className="mt-5 w-16 text-[13px] leading-tight text-muted">{item.unit}</span>
        </div>
      </div>
    </li>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold tracking-tight text-navy tabular-nums", tone)}>{value}</p>
    </div>
  );
}

function FormulaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-paper/60">{label}</dt>
      <dd className="text-paper tabular-nums">{value}</dd>
    </div>
  );
}
