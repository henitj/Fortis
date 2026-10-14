import {
  Activity,
  CloudLightning,
  Flame,
  Info,
  PlugZap,
  Snowflake,
  Sun,
  Waves,
  Wind,
} from "lucide-react";
import { HAZARDS } from "@/lib/preparedness-data";
import type { Hazard } from "@/lib/types";
import type { DraftErrors, ProfileDraft } from "@/lib/validation";

interface StepProps {
  draft: ProfileDraft;
  errors: DraftErrors;
  update: <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K],
  ) => void;
}

const HAZARD_ICONS = {
  storms: CloudLightning,
  flooding: Waves,
  wildfires: Flame,
  heat: Sun,
  cold: Snowflake,
  outages: PlugZap,
  earthquakes: Activity,
  hurricanes: Wind,
} satisfies Record<Hazard, typeof Sun>;

export function LocationStep({ draft, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#dae5dd] bg-[#f4f8f4] px-4 py-3.5 text-sm leading-6 text-forest">
        <Info size={17} className="mr-2 inline-block align-text-bottom" />{" "}
        Precise location is optional. We don&apos;t use it to predict hazards or
        look up live conditions.
      </div>
      <div>
        <label className="field-label" htmlFor="country">
          Country <span className="font-normal text-slate">(optional)</span>
        </label>
        <select
          id="country"
          className="field-input"
          value={draft.country}
          onChange={(event) =>
            update("country", event.target.value as ProfileDraft["country"])
          }
        >
          <option value="">Prefer not to say</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="OTHER">Somewhere else</option>
        </select>
        <p className="field-hint">
          Location is only displayed in your plan. Official links below are
          general U.S. resources, not local alerts.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="region">
            State or region{" "}
            <span className="font-normal text-slate">(optional)</span>
          </label>
          <input
            id="region"
            className="field-input"
            maxLength={120}
            autoComplete="address-level1"
            placeholder="e.g. California"
            value={draft.region}
            aria-invalid={Boolean(errors.region)}
            aria-describedby={errors.region ? "region-error" : undefined}
            onChange={(event) => update("region", event.target.value)}
          />
          {errors.region && (
            <p id="region-error" className="field-error">
              {errors.region}
            </p>
          )}
        </div>
        <div>
          <label className="field-label" htmlFor="locality">
            City or postal code{" "}
            <span className="font-normal text-slate">(optional)</span>
          </label>
          <input
            id="locality"
            className="field-input"
            maxLength={120}
            autoComplete="address-level2"
            placeholder="Only if you want to add it"
            value={draft.locality}
            aria-invalid={Boolean(errors.locality)}
            aria-describedby={errors.locality ? "locality-error" : undefined}
            onChange={(event) => update("locality", event.target.value)}
          />
          {errors.locality && (
            <p id="locality-error" className="field-error">
              {errors.locality}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CountField({
  id,
  label,
  value,
  hint,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="field-input"
        type="number"
        min={id === "adults" ? 1 : 0}
        max={30}
        step={1}
        inputMode="numeric"
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function CheckRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer gap-3 rounded-xl border border-line bg-white p-4 transition hover:border-[#adbeb3] has-[:checked]:border-forest/45 has-[:checked]:bg-[#f5f8f5]"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="min-w-0 [overflow-wrap:anywhere]">
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate">{hint}</span>
      </span>
    </label>
  );
}

export function HouseholdStep({ draft, errors, update }: StepProps) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-bold text-ink">People and pets</h3>
        <p className="mt-1 text-xs leading-5 text-slate">
          Include older adults in the adult number; the field below only helps
          tailor support tasks.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <CountField
            id="adults"
            label="Adults"
            value={draft.adults}
            error={errors.adults}
            onChange={(value) => update("adults", value)}
          />
          <CountField
            id="children"
            label="Children"
            value={draft.children}
            error={errors.children}
            onChange={(value) => update("children", value)}
          />
          <CountField
            id="olderAdults"
            label="Older adults needing additional support"
            value={draft.olderAdults}
            hint="Already counted among the adults above."
            error={errors.olderAdults}
            onChange={(value) => update("olderAdults", value)}
          />
          <CountField
            id="pets"
            label="Pets"
            value={draft.pets}
            error={errors.pets}
            onChange={(value) => update("pets", value)}
          />
        </div>
      </div>
      <div className="border-t border-line pt-6">
        <h3 className="text-sm font-bold text-ink">
          Support considerations{" "}
          <span className="font-normal text-slate">(optional)</span>
        </h3>
        <p className="mb-4 mt-1 text-xs leading-5 text-slate">
          No diagnoses or medication details needed. These answers only add
          relevant actions.
        </p>
        <div className="space-y-2.5">
          <CheckRow
            id="accessibility"
            label="Mobility or accessibility needs"
            hint="Adds accessible evacuation and essential-supply planning."
            checked={draft.accessibility}
            onChange={(value) => update("accessibility", value)}
          />
          <CheckRow
            id="poweredMedical"
            label="Powered medical equipment"
            hint="Adds a reminder to plan backup power with the equipment provider and healthcare team."
            checked={draft.poweredMedical}
            onChange={(value) => update("poweredMedical", value)}
          />
          <CheckRow
            id="communicationSupport"
            label="Communication assistance needed"
            hint="Adds a task to choose accessible ways to share updates."
            checked={draft.communicationSupport}
            onChange={(value) => update("communicationSupport", value)}
          />
        </div>
      </div>
    </div>
  );
}

export function HazardsStep({ draft, update }: StepProps) {
  function toggle(id: Hazard) {
    update(
      "hazards",
      draft.hazards.includes(id)
        ? draft.hazards.filter((hazard) => hazard !== id)
        : [...draft.hazards, id],
    );
  }
  return (
    <div>
      <p className="mb-5 text-sm leading-6 text-slate">
        Choose any that matter to you. These selections tailor tasks; they do
        not indicate that an event is likely or imminent. You can continue
        without selecting one for a general plan.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {HAZARDS.map((hazard) => {
          const Icon = HAZARD_ICONS[hazard.id];
          const selected = draft.hazards.includes(hazard.id);
          return (
            <label
              key={hazard.id}
              htmlFor={`hazard-${hazard.id}`}
              className={`relative flex min-h-[105px] cursor-pointer flex-wrap gap-4 rounded-xl border p-4 transition-colors hover:border-forest/50 ${selected ? "border-forest bg-[#f2f7f2]" : "border-line bg-white"}`}
            >
              <input
                id={`hazard-${hazard.id}`}
                type="checkbox"
                className="sr-only peer"
                checked={selected}
                onChange={() => toggle(hazard.id)}
              />
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-forest text-white" : "bg-paper text-forest"}`}
              >
                <Icon size={21} strokeWidth={1.8} />
              </span>
              <span className="min-w-[120px] flex-1 pr-3 [overflow-wrap:anywhere]">
                <span className="block text-sm font-bold text-ink">
                  {hazard.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate">
                  {hazard.description}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`absolute right-3 top-3 h-4 w-4 rounded-full border ${selected ? "border-forest bg-forest shadow-[inset_0_0_0_3px_#f2f7f2]" : "border-[#aab5b3]"}`}
              />
              <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" />
            </label>
          );
        })}
      </div>
      <p className="mt-5 text-xs text-slate">
        {draft.hazards.length === 0
          ? "No hazards selected — your plan will cover general preparedness."
          : `${draft.hazards.length} ${draft.hazards.length === 1 ? "hazard" : "hazards"} selected.`}
      </p>
    </div>
  );
}

export function PreferencesStep({ draft, errors, update }: StepProps) {
  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-sm font-bold text-ink">
          How many days should supplies cover?
        </legend>
        <p className="mt-1 text-xs leading-5 text-slate">
          Change this later; every baseline recalculates automatically.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {([3, 7, 14] as const).map((days) => (
            <label
              key={days}
              className={`relative flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-xl border px-2 text-center transition hover:border-forest/60 ${draft.days === days ? "border-forest bg-[#f2f7f2]" : "border-line bg-white"}`}
            >
              <input
                type="radio"
                name="days"
                value={days}
                checked={draft.days === days}
                onChange={() => update("days", days)}
                className="peer sr-only"
              />
              <span className="font-display text-[24px] font-extrabold leading-none">
                {days}
              </span>
              <span className="mt-1 text-xs text-slate">days</span>
              <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset aria-describedby={errors.vehicle ? "vehicle-error" : undefined}>
        <legend className="text-sm font-bold text-ink">
          Is a vehicle available for your household?
        </legend>
        <div className="mt-3 flex gap-3">
          {[true, false].map((value) => (
            <label
              key={String(value)}
              className={`relative flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold hover:border-forest/60 ${draft.vehicle === value ? "border-forest bg-[#f2f7f2]" : "border-line bg-white"}`}
            >
              <input
                type="radio"
                name="vehicle"
                checked={draft.vehicle === value}
                onChange={() => update("vehicle", value)}
                className="peer sr-only"
              />
              <span>{value ? "Yes" : "No"}</span>
              <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" />
            </label>
          ))}
        </div>
        {errors.vehicle && (
          <p id="vehicle-error" className="field-error" role="alert">
            {errors.vehicle}
          </p>
        )}
      </fieldset>
      <CheckRow
        id="evac-assist"
        label="Evacuation assistance may be needed"
        hint="Adds a task to arrange accessible support and transport options in advance."
        checked={draft.evacuationAssistance}
        onChange={(value) => update("evacuationAssistance", value)}
      />
      <fieldset>
        <legend className="text-sm font-bold text-ink">
          How much on-screen detail would you like?
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["concise", "detailed"] as const).map((value) => (
            <label
              key={value}
              className={`relative cursor-pointer rounded-xl border p-4 hover:border-forest/60 ${draft.detail === value ? "border-forest bg-[#f2f7f2]" : "border-line bg-white"}`}
            >
              <input
                type="radio"
                name="detail"
                checked={draft.detail === value}
                onChange={() => update("detail", value)}
                className="peer sr-only"
              />
              <span className="block text-sm font-bold capitalize">
                {value}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate">
                {value === "concise"
                  ? "A focused checklist with essential context."
                  : "Show extra reasoning, time estimates, and links on each task."}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

const COUNTRY_LABELS: Record<ProfileDraft["country"], string> = {
  "": "Not provided",
  US: "United States",
  CA: "Canada",
  OTHER: "Elsewhere",
};

export function ReviewStep({
  draft,
  onEdit,
}: {
  draft: ProfileDraft;
  onEdit: (step: number) => void;
}) {
  const sections = [
    {
      title: "Location",
      step: 0,
      lines: [
        COUNTRY_LABELS[draft.country],
        [draft.region.trim(), draft.locality.trim()]
          .filter(Boolean)
          .join(" · "),
      ].filter(Boolean),
    },
    {
      title: "Household",
      step: 1,
      lines: [
        `${draft.adults} adults · ${draft.children} children · ${draft.pets} pets`,
        ...(Number(draft.olderAdults) > 0
          ? [`${draft.olderAdults} older adults (included in adults)`]
          : []),
        ...([
          draft.accessibility && "Accessibility needs",
          draft.poweredMedical && "Powered medical equipment",
          draft.communicationSupport && "Communication support",
        ].filter(Boolean) as string[]),
      ],
    },
    {
      title: "Hazards",
      step: 2,
      lines: [
        draft.hazards.length
          ? HAZARDS.filter((hazard) => draft.hazards.includes(hazard.id))
              .map((hazard) => hazard.label)
              .join(" · ")
          : "General preparedness (no hazards selected)",
      ],
    },
    {
      title: "Preferences",
      step: 3,
      lines: [
        `${draft.days}-day plan · ${draft.detail} view`,
        `${draft.vehicle ? "Vehicle available" : "No vehicle available"}${draft.evacuationAssistance ? " · Evacuation assistance may be needed" : ""}`,
      ],
    },
  ];
  return (
    <div className="space-y-3">
      <p className="mb-5 text-sm leading-6 text-slate">
        Everything here stays on this device. You can change these answers and
        regenerate recommendations whenever you like.
      </p>
      {sections.map((section) => (
        <section
          key={section.title}
          className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-white p-4 sm:p-5"
        >
          <div className="min-w-[120px] flex-1 [overflow-wrap:anywhere]">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-forest">
              {section.title}
            </h3>
            {section.lines.map((line, index) => (
              <p
                key={`${section.title}-${index}`}
                className="mt-1.5 text-sm leading-6 text-ink"
              >
                {line}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onEdit(section.step)}
            className="shrink-0 rounded-md text-xs font-bold text-forest underline underline-offset-4 hover:text-ink"
          >
            Edit <span className="sr-only">{section.title}</span>
          </button>
        </section>
      ))}
      <p className="pt-3 text-xs leading-5 text-slate">
        Your plan is built instantly using local rules—not a live risk
        assessment or AI prediction.
      </p>
    </div>
  );
}
