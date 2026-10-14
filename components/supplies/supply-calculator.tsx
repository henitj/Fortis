"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, Waves } from "lucide-react";
import type { HouseholdProfile, SupplyId, SupplySettings } from "@/lib/types";
import {
  getSupplyMath,
  getSupplyProgress,
  SUPPLY_CATEGORIES,
} from "@/lib/supply-calculations";
import type { SupplyRow } from "@/lib/supply-calculations";

interface Props {
  profile: HouseholdProfile;
  settings: SupplySettings;
  rows: SupplyRow[];
  onChange: (next: SupplySettings) => void;
}

export function SupplyCalculator({ profile, settings, rows, onChange }: Props) {
  const math = getSupplyMath(profile, settings.petGallonsPerDay);
  const progress = getSupplyProgress(rows);

  function updateItem(
    id: SupplyId,
    patch: { plannedOverride?: number; available?: number },
    reset = false,
  ) {
    const current = settings.items[id] ?? { available: 0 };
    const next = { ...current, ...patch };
    if (reset) delete next.plannedOverride;
    onChange({ ...settings, items: { ...settings.items, [id]: next } });
  }

  return (
    <section
      id="supplies"
      className="scroll-mt-28"
      aria-labelledby="supplies-title"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-forest">
            02 / Supply planning
          </p>
          <h2
            id="supplies-title"
            className="font-display mt-2 text-2xl font-extrabold tracking-[-0.045em] sm:text-[30px]"
          >
            What to have on hand.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate">
            Targets are starting points. Change the target or enter what you
            already have; everything updates immediately.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-forest">
          {progress.available} of {progress.total} items covered
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[#cbded1] bg-[#edf5ef] p-5">
          <p className="text-xs font-bold text-forest">
            People&apos;s water baseline
          </p>
          <p className="font-display mt-2 text-[28px] font-extrabold tracking-[-0.05em]">
            {math.baselineWaterGallons}{" "}
            <span className="text-sm font-medium">gallons</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-[#486454]">
            {math.people} {math.people === 1 ? "person" : "people"} ×{" "}
            {math.days} days × 1 gal/day
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-bold text-slate">Food planning</p>
          <p className="font-display mt-2 text-[28px] font-extrabold tracking-[-0.05em]">
            {math.personDays}{" "}
            <span className="text-sm font-medium">person-days</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-slate">
            {math.personDays} × 3 = {math.suggestedMeals} meal occasions
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-bold text-slate">Supply item progress</p>
          <p className="font-display mt-2 text-[28px] font-extrabold tracking-[-0.05em]">
            {progress.needed}{" "}
            <span className="text-sm font-medium">still needed</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-slate">
            {progress.total} planned · {progress.available} covered
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#e6dfcc] bg-[#fbf8f0] p-4 text-xs leading-6 text-[#655536]">
        <strong className="text-ink">How we calculate:</strong> At least one
        gallon per person per day is a general drinking and basic-use water
        starting point. Older adults are already in the adult count; pets are
        separate. Hotter weather, illness, physical activity, pregnancy and
        other circumstances may increase needs. Three meals per person-day is
        only a planning count, not a guarantee of nutritional adequacy.
      </div>

      {profile.household.pets > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4ef] text-forest">
            <Waves size={19} />
          </span>
          <div className="min-w-[190px] flex-1">
            <label className="block text-sm font-bold" htmlFor="pet-rate">
              Pet water estimate per pet, per day
            </label>
            <p className="mt-0.5 text-xs leading-5 text-slate">
              {profile.household.pets} pets × {math.days} days ×{" "}
              {math.petGallonsPerDay} gal = {math.petWaterGallons} gal
              estimated. Adjust for species, size, weather and health.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <QuantityInput
              id="pet-rate"
              label="Gallons per pet per day"
              value={settings.petGallonsPerDay}
              decimal
              min={0.05}
              max={5}
              onValidChange={(petGallonsPerDay) =>
                onChange({ ...settings, petGallonsPerDay })
              }
            />
            <span className="text-xs font-semibold text-slate">gal</span>
          </div>
        </div>
      )}

      <div className="mt-7 space-y-5">
        {SUPPLY_CATEGORIES.map((category) => {
          const items = rows.filter((row) => row.category === category.id);
          if (!items.length) return null;
          const covered = getSupplyProgress(items);
          return (
            <section
              key={category.id}
              className="card overflow-hidden [overflow-wrap:anywhere]"
              aria-labelledby={`supply-${category.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-[#fcfcfa] px-5 py-4 sm:px-6">
                <h3
                  id={`supply-${category.id}`}
                  className="font-display text-base font-extrabold tracking-[-0.025em]"
                >
                  {category.label}
                </h3>
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-slate">
                    {covered.available}/{covered.total} covered
                  </span>
                  <div
                    className="h-[6px] w-[80px] overflow-hidden rounded-full bg-[#e9ece9]"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-forest"
                      style={{
                        width: `${covered.total ? (covered.available / covered.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="divide-y divide-line">
                {items.map((row) => (
                  <SupplyItem
                    key={row.id}
                    row={row}
                    onTarget={(value) =>
                      updateItem(row.id, { plannedOverride: value })
                    }
                    onAvailable={(value) =>
                      updateItem(row.id, { available: value })
                    }
                    onReset={() => updateItem(row.id, {}, true)}
                    onCover={() =>
                      updateItem(row.id, { available: row.planned })
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <p className="mt-5 text-xs leading-6 text-slate">
        A plan is personal: consult a pharmacist or healthcare professional
        about medications. For powered medical equipment, consult the equipment
        provider and healthcare team about backup power and continuity. Review
        supplies and expiration dates periodically.
      </p>
    </section>
  );
}

function SupplyItem({
  row,
  onTarget,
  onAvailable,
  onReset,
  onCover,
}: {
  row: SupplyRow;
  onTarget: (value: number) => void;
  onAvailable: (value: number) => void;
  onReset: () => void;
  onCover: () => void;
}) {
  const covered = row.planned > 0 && row.remaining === 0;
  return (
    <div className="grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-bold text-ink">{row.title}</h4>
          {covered && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f2eb] px-2 py-0.5 text-[10px] font-bold text-forest">
              <Check size={11} /> Covered
            </span>
          )}
          {row.planned === 0 && (
            <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-slate">
              Not planned
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-slate">{row.note}</p>
        <p className="mt-1 text-[11px] font-medium text-slate">
          Default target: {row.baseline} {row.unit}
          {row.custom ? " · Custom target" : ""}
        </p>
        {row.id === "people-water" && row.planned < row.baseline && (
          <p className="mt-1 text-xs font-semibold text-warning">
            Below the general water baseline—review your target.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor={`target-${row.id}`}
            className="mb-1 block text-[11px] font-bold text-slate"
          >
            Target <span className="font-normal">({row.unit})</span>
          </label>
          <QuantityInput
            id={`target-${row.id}`}
            label={`Target quantity for ${row.title}`}
            value={row.planned}
            decimal={row.decimal}
            onValidChange={onTarget}
          />
        </div>
        <div>
          <label
            htmlFor={`have-${row.id}`}
            className="mb-1 block text-[11px] font-bold text-slate"
          >
            On hand <span className="font-normal">({row.unit})</span>
          </label>
          <QuantityInput
            id={`have-${row.id}`}
            label={`Available quantity for ${row.title}`}
            value={row.available}
            decimal={row.decimal}
            onValidChange={onAvailable}
          />
        </div>
        <div className="min-w-[60px] pb-1">
          <span className="block text-[11px] font-bold text-slate">Need</span>
          <span className="mt-1 block text-sm font-extrabold text-ink">
            {row.remaining}{" "}
            <span className="text-[11px] font-normal text-slate">
              {row.unit}
            </span>
          </span>
        </div>
        <div className="flex gap-1 pb-0.5">
          {!covered && row.planned > 0 && (
            <button
              type="button"
              onClick={onCover}
              className="min-h-9 rounded-lg px-2 text-[11px] font-bold text-forest hover:bg-[#edf4ee]"
              aria-label={`Have it — mark ${row.title} fully available`}
            >
              Have it
            </button>
          )}
          {row.custom && (
            <button
              type="button"
              onClick={onReset}
              className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-slate hover:bg-paper"
              aria-label={`Reset ${row.title} target to default`}
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuantityInput({
  id,
  label,
  value,
  onValidChange,
  decimal = false,
  min = 0,
  max = 100000,
}: {
  id: string;
  label: string;
  value: number;
  onValidChange: (value: number) => void;
  decimal?: boolean;
  min?: number;
  max?: number;
}) {
  const [text, setText] = useState(String(value));
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (document.activeElement !== ref.current) setText(String(value));
  }, [value]);

  function handleChange(next: string) {
    setText(next);
    if (next === "") {
      setError("");
      return;
    }
    const validFormat = decimal
      ? /^\d+(\.\d{0,2})?$/.test(next)
      : /^\d+$/.test(next);
    const parsed = Number(next);
    if (
      !validFormat ||
      !Number.isFinite(parsed) ||
      parsed < min ||
      parsed > max
    ) {
      setError(
        `Enter ${decimal ? "a number (up to 2 decimals)" : "a whole number"} from ${min} to ${max}.`,
      );
      return;
    }
    setError("");
    onValidChange(parsed);
  }

  return (
    <>
      <input
        ref={ref}
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={decimal ? "0.01" : "1"}
        className="h-10 w-[90px] rounded-lg border border-[#cbd1d2] bg-white px-2 text-sm font-semibold text-ink focus:border-forest focus:outline focus:outline-2 focus:outline-forest"
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={() => {
          if (error || text === "") {
            setText(String(value));
            setError("");
          } else setText(String(Number(text)));
        }}
      />
      {error && (
        <span
          id={`${id}-error`}
          className="block max-w-[130px] pt-1 text-[10px] leading-4 text-danger"
          role="alert"
        >
          {error}
        </span>
      )}
    </>
  );
}
