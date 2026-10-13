import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { TASK_CATEGORIES, PRIORITY_LABEL } from "@/lib/data/categories";
import { getHazard } from "@/lib/data/hazards";
import { describeLocation } from "@/lib/data/locations";
import { getResource } from "@/lib/data/resources";
import { formatNumber, gallonsToLiters, SUPPLY_CATEGORIES } from "@/lib/engine/supplies";
import type { PlanView } from "@/components/dashboard/use-plan-view";
import { GENERAL_RESOURCE_IDS, householdResourceIds } from "@/components/dashboard/resources-tab";
import { pluralize } from "@/lib/utils";

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

/**
 * The printable plan. Hidden on screen; rendered by the browser's print
 * pipeline so "Save as PDF" produces the user's actual plan.
 */
export function PrintPlan({ view }: { view: PlanView }) {
  return (
    <div className="hidden bg-white text-[10.5pt] leading-snug text-navy print:block" aria-hidden>
      <FullPlan view={view} />
      <ContactCard view={view} />
    </div>
  );
}

function FullPlan({ view }: { view: PlanView }) {
  const { plan, tasks, readiness, water, food, supplies, guidance } = view;
  const p = plan.profile;
  const h = p.household;
  const status = plan.taskStatus;
  const hazardResources = unique(p.hazards.flatMap((id) => getHazard(id).resources)).map(getResource);
  const links = uniqueBy(
    [...guidance.resources, ...hazardResources, ...householdResourceIds(p).map(getResource), ...GENERAL_RESOURCE_IDS.map(getResource)],
    (r) => r.url,
  );

  return (
    <article className="print-full">
      <header className="flex items-end justify-between border-b-2 border-navy pb-3">
        <div>
          <Logo tone="light" showTagline />
          <h1 className="mt-3 text-[20pt] font-bold tracking-tight">Household Emergency Plan</h1>
        </div>
        <div className="text-right text-[9pt] text-navy-600">
          <p>Updated {dateFmt.format(new Date(plan.updatedAt))}</p>
          <p>{describeLocation(p.location.country, p.location.region, p.location.locality)}</p>
        </div>
      </header>

      <p className="print-avoid-break mt-4 rounded border-2 border-danger px-3 py-2 text-[10pt] font-semibold text-danger">
        If officials tell you to evacuate, leave immediately — do not delay to gather supplies. In a life-threatening
        emergency, call your local emergency number.
      </p>

      <section className="print-avoid-break mt-5">
        <H2>Household</H2>
        <dl className="grid grid-cols-4 gap-x-4 gap-y-2">
          <Fact label="Adults" value={h.adults} />
          <Fact label="Children" value={h.children} />
          <Fact label="Older adults needing help" value={h.olderAdults} />
          <Fact label="Pets" value={h.pets} />
          <Fact label="Plan length" value={`${p.preferences.durationDays} days`} />
          <Fact label="Vehicle" value={p.preferences.hasVehicle === "yes" ? "Yes" : "No"} />
          <Fact label="Evacuation help" value={{ yes: "Needed", no: "Not needed", unsure: "Unsure" }[p.preferences.evacuationAssistance]} />
          <Fact label="Checklist" value={`${readiness.completed}/${readiness.applicable} done`} />
        </dl>
        <p className="mt-2 text-[9.5pt]">
          <span className="font-semibold">Hazards planned for:</span> {p.hazards.map((id) => getHazard(id).label).join(", ")}
        </p>
      </section>

      <section className="mt-5">
        <H2>Communication plan</H2>
        <div className="grid grid-cols-2 gap-4">
          <div className="print-avoid-break">
            <H3>Contacts</H3>
            <table className="w-full border-collapse text-[9.5pt]">
              <tbody>
                {plan.communication.contacts
                  .filter((c) => c.label.trim() || c.phone.trim())
                  .map((c) => (
                    <tr key={c.id} className="border-b border-line">
                      <td className="py-1 pr-2 font-semibold">{c.label || "—"}</td>
                      <td className="py-1 pr-2 tabular-nums">{c.phone}</td>
                      <td className="py-1 text-navy-600">{c.note}</td>
                    </tr>
                  ))}
                {Array.from({ length: Math.max(0, 3 - view.communication.contacts) }, (_, i) => (
                  <tr key={`blank-${i}`} className="border-b border-line">
                    <td className="h-6" colSpan={3} />
                  </tr>
                ))}
              </tbody>
            </table>
            <H3 className="mt-3">Out-of-area contact</H3>
            <WriteIn value={[plan.communication.outOfArea.name, plan.communication.outOfArea.phone, plan.communication.outOfArea.note].filter(Boolean).join(" · ")} />
          </div>
          <div className="print-avoid-break">
            <H3>Meeting places</H3>
            <p className="text-[9pt] text-navy-600">Primary — near home</p>
            <WriteIn value={place(plan.communication.meetingPlaces.primary)} />
            <p className="mt-2 text-[9pt] text-navy-600">Alternate — outside the neighborhood</p>
            <WriteIn value={place(plan.communication.meetingPlaces.alternate)} />
          </div>
        </div>
        {plan.communication.instructions.trim() || plan.communication.reunification.trim() ? (
          <div className="mt-3 grid grid-cols-2 gap-4">
            {plan.communication.instructions.trim() ? (
              <div className="print-avoid-break">
                <H3>Household instructions</H3>
                <p className="whitespace-pre-wrap text-[9.5pt]">{plan.communication.instructions}</p>
              </div>
            ) : null}
            {plan.communication.reunification.trim() ? (
              <div className="print-avoid-break">
                <H3>Reunification</H3>
                <p className="whitespace-pre-wrap text-[9.5pt]">{plan.communication.reunification}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mt-5">
        <H2>Supplies</H2>
        <div className="print-avoid-break grid grid-cols-2 gap-4 text-[9.5pt]">
          <div className="rounded border border-line p-2.5">
            <p className="font-semibold">
              Water: {formatNumber(water.totalGallons)} gallons (≈ {formatNumber(gallonsToLiters(water.totalGallons), 1)} L)
            </p>
            <p className="mt-1 font-mono text-[8.5pt]">
              {water.people} people × {water.days} days × 1 gal{water.multiplier > 1 ? ` × ${water.multiplier} hot weather` : ""} ={" "}
              {formatNumber(water.householdGallons)} gal
              {water.pets ? ` + pets (estimate) ${water.pets} × ${water.days} × ${formatNumber(water.petGallonsPerDay, 3)} = ${formatNumber(water.petGallons)} gal` : ""}
            </p>
            <p className="mt-1 text-[8.5pt] text-navy-600">
              Baseline only. Heat, illness, activity, pregnancy and nursing increase needs.
            </p>
          </div>
          <div className="rounded border border-line p-2.5">
            <p className="font-semibold">Food: {food.meals} meals ({food.personDays} person-days)</p>
            <p className="mt-1 text-[8.5pt] text-navy-600">
              Planning quantity, not a nutritional guarantee. Coordinate an emergency medication supply with a pharmacist
              {h.poweredMedical === "yes" ? "; consult your equipment provider and healthcare team about backup power" : ""}.
            </p>
          </div>
        </div>
        <div className="mt-3 columns-2 gap-6">
          {SUPPLY_CATEGORIES.map((cat) => {
            const items = supplies.filter((s) => s.category === cat.id && s.status !== "skipped");
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="print-avoid-break mb-2.5">
                <H3>{cat.label}</H3>
                <ul className="text-[9.5pt]">
                  {items.map((s) => (
                    <li key={s.id} className="flex items-baseline gap-2 py-0.5">
                      <Box checked={s.status === "available"} />
                      <span className="flex-1">{s.name}</span>
                      <span className="tabular-nums text-navy-600">
                        {s.onHand}/{s.target} {s.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="print-break-before">
        <H2>Action checklist</H2>
        <p className="mb-3 text-[9pt] text-navy-600">
          {readiness.completed} of {readiness.applicable} applicable tasks complete
          {readiness.notApplicable ? ` · ${pluralize(readiness.notApplicable, "task")} marked not applicable` : ""}. Checklist
          completion does not measure safety.
        </p>
        {TASK_CATEGORIES.map((cat) => {
          const items = tasks.filter((t) => t.category === cat.id && status[t.id] !== "na");
          if (items.length === 0) return null;
          return (
            <div key={cat.id} className="mb-3">
              <H3 className="print-keep-with-next">{cat.label}</H3>
              <ul>
                {items.map((t) => (
                  <li key={t.id} className="print-avoid-break flex gap-2 border-b border-line/70 py-1.5">
                    <Box checked={status[t.id] === "done"} />
                    <div className="flex-1">
                      <p className="font-semibold">
                        {t.title}{" "}
                        <span className="text-[8pt] font-semibold uppercase tracking-wide text-navy-600">
                          · {PRIORITY_LABEL[t.effectivePriority]}
                        </span>
                      </p>
                      <p className="text-[9pt] text-navy-600">{t.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="print-avoid-break mt-5">
        <H2>Safety reminders</H2>
        <ul className="list-disc space-y-0.5 pl-5 text-[9.5pt]">
          <li>Follow instructions from local officials. Evacuate immediately when told to.</li>
          <li>Never use generators, grills or camp stoves indoors or in a garage.</li>
          {p.hazards.includes("flooding") || p.hazards.includes("hurricanes") ? (
            <li>Turn around, don&apos;t drown — never walk or drive through floodwater.</li>
          ) : null}
          {p.hazards.includes("earthquakes") ? <li>Drop, cover and hold on during shaking.</li> : null}
          <li>Text rather than call when networks are congested.</li>
          <li>Review this plan and rotate supplies at least twice a year.</li>
        </ul>
      </section>

      <section className="print-avoid-break mt-5">
        <H2>Official resources</H2>
        <ul className="columns-2 gap-6 text-[8.5pt]">
          {links.map((r) => (
            <li key={r.url} className="print-avoid-break mb-1">
              <span className="font-semibold">{r.title}</span> · {r.publisher}
              <br />
              <span className="font-mono text-navy-600">{r.url}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-6 border-t border-line pt-2 text-[8pt] text-navy-600">
        Generated by FORTIS from predefined preparedness rules. This plan is a planning aid, not a substitute for official
        emergency instructions or professional medical advice.
      </footer>
    </article>
  );
}

function ContactCard({ view }: { view: PlanView }) {
  const c = view.plan.communication;
  const contacts = c.contacts.filter((x) => x.label.trim() || x.phone.trim()).slice(0, 5);
  return (
    <article className="print-card">
      <p className="mb-3 text-[9pt] text-navy-600">Cut along the border, fold in half and keep in your wallet or bag.</p>
      <div className="grid w-[7in] grid-cols-2 border-2 border-dashed border-navy-600">
        <div className="border-r border-dashed border-navy-600 p-4">
          <Logo tone="light" />
          <p className="mt-2 text-[11pt] font-bold">Emergency Contact Card</p>
          <dl className="mt-2 space-y-1.5 text-[9pt]">
            <div>
              <dt className="font-semibold uppercase tracking-wide text-[7.5pt] text-navy-600">Out-of-area contact</dt>
              <dd><WriteIn value={[c.outOfArea.name, c.outOfArea.phone].filter(Boolean).join(" · ")} small /></dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-[7.5pt] text-navy-600">Meet near home</dt>
              <dd><WriteIn value={place(c.meetingPlaces.primary)} small /></dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-[7.5pt] text-navy-600">Meet outside neighborhood</dt>
              <dd><WriteIn value={place(c.meetingPlaces.alternate)} small /></dd>
            </div>
          </dl>
        </div>
        <div className="p-4">
          <p className="font-semibold uppercase tracking-wide text-[7.5pt] text-navy-600">Contacts</p>
          <ul className="mt-1 text-[9pt]">
            {contacts.map((x) => (
              <li key={x.id} className="flex justify-between gap-2 border-b border-line py-1">
                <span className="font-semibold">{x.label}</span>
                <span className="tabular-nums">{x.phone}</span>
              </li>
            ))}
            {Array.from({ length: Math.max(0, 5 - contacts.length) }, (_, i) => (
              <li key={i} className="h-6 border-b border-line" />
            ))}
          </ul>
          <p className="mt-2 text-[8pt] font-semibold text-danger">If told to evacuate, leave immediately.</p>
        </div>
      </div>
    </article>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="print-keep-with-next mb-2 border-b border-line pb-1 text-[13pt] font-bold">{children}</h2>;
}
function H3({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`mb-1 text-[10pt] font-bold ${className ?? ""}`}>{children}</h3>;
}
function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[8pt] uppercase tracking-wide text-navy-600">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
function Box({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex size-[11px] shrink-0 translate-y-[1px] items-center justify-center border border-navy text-[8px] leading-none font-bold">
      {checked ? "✓" : ""}
    </span>
  );
}
function WriteIn({ value, small }: { value: string; small?: boolean }) {
  return value ? (
    <p className={small ? "text-[9pt]" : "text-[9.5pt]"}>{value}</p>
  ) : (
    <p className={`border-b border-navy-600/50 ${small ? "h-5" : "h-6"}`} />
  );
}
function place(m: { name: string; details: string }): string {
  return [m.name, m.details].filter((s) => s.trim()).join(" — ");
}
function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}
function uniqueBy<T>(xs: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  return xs.filter((x) => (seen.has(key(x)) ? false : (seen.add(key(x)), true)));
}
