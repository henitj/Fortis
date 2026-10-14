import { FortisLogo } from "@/components/branding/fortis-logo";
import {
  HAZARDS,
  PRIORITY_LABELS,
  TASK_CATEGORIES,
} from "@/lib/preparedness-data";
import {
  DISCLAIMER,
  locationResourceNote,
  OFFICIAL_RESOURCES,
} from "@/lib/official-resources";
import { getTaskReason } from "@/lib/rules-engine";
import { getSupplyMath, SUPPLY_CATEGORIES } from "@/lib/supply-calculations";
import type { SupplyRow } from "@/lib/supply-calculations";
import type { Readiness } from "@/lib/readiness";
import type { PreparednessTask, StoredPlan } from "@/lib/types";

const COUNTRY_LABELS = {
  "": "",
  US: "United States",
  CA: "Canada",
  OTHER: "Other / not specified",
} as const;

export function PrintablePlan({
  plan,
  tasks,
  rows,
  readiness,
}: {
  plan: StoredPlan;
  tasks: PreparednessTask[];
  rows: SupplyRow[];
  readiness: Readiness;
}) {
  const { profile, communication } = plan;
  const { household, location, preferences } = profile;
  const math = getSupplyMath(profile, plan.supplies.petGallonsPerDay);
  const contacts = communication.contacts.filter(
    (contact) => contact.label.trim() || contact.phone.trim(),
  );
  const hasCommunication = Boolean(
    contacts.length ||
    communication.outOfAreaName.trim() ||
    communication.outOfAreaPhone.trim() ||
    communication.primaryMeeting.trim() ||
    communication.alternateMeeting.trim() ||
    communication.instructions.trim() ||
    communication.reunification.trim(),
  );
  const usedUrls = new Set(
    tasks.map((task) => task.officialUrl).filter(Boolean),
  );
  const resources = OFFICIAL_RESOURCES.filter((resource) =>
    usedUrls.has(resource.url),
  );
  const locationParts = [
    COUNTRY_LABELS[location.country],
    location.region.trim(),
    location.locality.trim(),
  ].filter(Boolean);

  return (
    <article
      className="print-document"
      aria-label="Printable FORTIS emergency preparedness plan"
    >
      <header className="print-header">
        <div>
          <FortisLogo />
          <p className="print-tagline">Strength Through Preparation.</p>
        </div>
        <div className="print-dates">
          <p>Created {formatDate(plan.createdAt)}</p>
          <p>Updated {formatDate(plan.updatedAt)}</p>
        </div>
      </header>
      <div className="print-intro">
        <h1>Household preparedness plan</h1>
        <p>
          A practical starting point for your household. Review it regularly and
          follow current official instructions during an emergency.
        </p>
      </div>
      <section className="print-section" aria-labelledby="print-household">
        <h2 id="print-household">01 / Household & planning scope</h2>
        <div className="print-facts">
          <p>
            <strong>People:</strong> {math.people} ({household.adults} adults,{" "}
            {household.children} children)
          </p>
          <p>
            <strong>Older adults needing support:</strong>{" "}
            {household.olderAdults} (included in adults)
          </p>
          <p>
            <strong>Pets:</strong> {household.pets}
          </p>
          <p>
            <strong>Planning duration:</strong> {preferences.days} days
          </p>
          <p>
            <strong>Vehicle available:</strong>{" "}
            {preferences.vehicle ? "Yes" : "No"}
          </p>
          <p>
            <strong>Evacuation assistance:</strong>{" "}
            {preferences.evacuationAssistance
              ? "May be needed"
              : "Not indicated"}
          </p>
        </div>
        {(household.accessibility ||
          household.poweredMedical ||
          household.communicationSupport) && (
          <p className="print-detail">
            <strong>Additional considerations:</strong>{" "}
            {[
              household.accessibility && "accessibility / mobility",
              household.poweredMedical && "powered medical equipment",
              household.communicationSupport && "communication support",
            ]
              .filter(Boolean)
              .join("; ")}
            .
          </p>
        )}
        {locationParts.length > 0 && (
          <p className="print-detail">
            <strong>Location provided:</strong> {locationParts.join(" · ")}
          </p>
        )}
        <p className="print-detail">
          <strong>Selected hazards:</strong>{" "}
          {profile.hazards.length
            ? HAZARDS.filter((hazard) => profile.hazards.includes(hazard.id))
                .map((hazard) => hazard.label)
                .join(", ")
            : "None selected — general all-hazards plan"}
        </p>
      </section>

      <section className="print-section" aria-labelledby="print-progress">
        <h2 id="print-progress">02 / Preparedness checklist completion</h2>
        <p>
          <strong>
            {readiness.percentage}% · {readiness.completed} of{" "}
            {readiness.applicable} applicable tasks complete.
          </strong>{" "}
          {readiness.remaining} remaining
          {readiness.notApplicable
            ? `; ${readiness.notApplicable} marked not applicable`
            : ""}
          .
        </p>
        <p className="print-muted">
          This percentage reflects checklist completion only. It does not
          measure actual safety or predict emergency outcomes.
        </p>
      </section>

      <section className="print-section" aria-labelledby="print-supplies">
        <h2 id="print-supplies">03 / Supply calculations & inventory</h2>
        <div className="print-calculations">
          <p>
            <strong>People&apos;s water baseline:</strong> {math.people} people
            × {math.days} days × at least 1 gallon ={" "}
            <strong>{math.baselineWaterGallons} gal.</strong> For drinking and
            basic use; older adults are already counted among adults.
          </p>
          <p>
            <strong>Food planning:</strong> {math.people} people × {math.days}{" "}
            days = <strong>{math.personDays} person-days</strong>; × 3 meal
            occasions = <strong>{math.suggestedMeals} meals.</strong> This is
            not a nutritional assessment.
          </p>
          {household.pets > 0 && (
            <p>
              <strong>Separate pet water estimate:</strong> {household.pets}{" "}
              pets × {math.days} days × {math.petGallonsPerDay} gal per pet per
              day = <strong>{math.petWaterGallons} gal.</strong> Adjust for
              species, size, weather and health; pets are not counted as people.
            </p>
          )}
        </div>
        <p className="print-muted">
          Heat, illness, physical activity, pregnancy and other factors can
          increase water needs. Targets below may be customized; the baseline is
          shown for comparison. &quot;On hand&quot; records what you entered;
          &quot;Need&quot; is max(0, target − on hand).
        </p>
        {SUPPLY_CATEGORIES.map((category) => {
          const items = rows.filter((row) => row.category === category.id);
          if (!items.length) return null;
          return (
            <div key={category.id} className="print-table-group">
              <h3>{category.label}</h3>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Supply / unit</th>
                    <th scope="col">Baseline</th>
                    <th scope="col">Target</th>
                    <th scope="col">On hand</th>
                    <th scope="col">Need</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id}>
                      <th scope="row">
                        {row.title}
                        <span className="print-unit">
                          {row.unit}
                          {row.custom ? " · custom target" : ""}
                        </span>
                      </th>
                      <td>{row.baseline}</td>
                      <td>{row.planned}</td>
                      <td>{row.available}</td>
                      <td>{row.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>

      <section className="print-section" aria-labelledby="print-actions">
        <h2 id="print-actions">04 / Preparation actions</h2>
        <p className="print-muted">
          All applicable recommendations are listed below. &quot;Not
          applicable&quot; items are shown but excluded from the completion
          percentage. Each action is included for a reason shown below.
        </p>
        {TASK_CATEGORIES.map((category) => {
          const items = tasks.filter((task) => task.category === category.id);
          if (!items.length) return null;
          return (
            <div key={category.id} className="print-task-group">
              <h3>{category.label}</h3>
              <ul>
                {items.map((task) => {
                  const status = plan.taskStates[task.id] ?? "todo";
                  return (
                    <li key={task.id} className="print-task">
                      <div className="print-task-title">
                        <span className="print-check" aria-hidden="true">
                          {status === "done"
                            ? "☑"
                            : status === "not-applicable"
                              ? "—"
                              : "☐"}
                        </span>
                        <strong>{task.title}</strong>
                        <span className="print-task-status">
                          {status === "done"
                            ? "DONE"
                            : status === "not-applicable"
                              ? "NOT APPLICABLE"
                              : `TO DO · ${PRIORITY_LABELS[task.priority].toUpperCase()}`}
                        </span>
                      </div>
                      <p>{task.description}</p>
                      <p className="print-reason">
                        {getTaskReason(task, profile)}
                        {task.estimatedMinutes
                          ? ` Approx. ${task.estimatedMinutes} min to plan.`
                          : ""}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      {hasCommunication && (
        <section className="print-section" aria-labelledby="print-contacts">
          <h2 id="print-contacts">05 / Emergency communication plan</h2>
          {contacts.length > 0 && (
            <div className="print-contact-block">
              <h3>Household contacts</h3>
              {contacts.map((contact) => (
                <p key={contact.id}>
                  <strong>{contact.label.trim() || "Contact"}</strong>
                  {contact.phone.trim() ? ` — ${contact.phone.trim()}` : ""}
                </p>
              ))}
            </div>
          )}
          {(communication.outOfAreaName.trim() ||
            communication.outOfAreaPhone.trim()) && (
            <div className="print-contact-block">
              <h3>Out-of-area contact</h3>
              <p>
                {communication.outOfAreaName.trim()}
                {communication.outOfAreaName.trim() &&
                communication.outOfAreaPhone.trim()
                  ? " — "
                  : ""}
                {communication.outOfAreaPhone.trim()}
              </p>
            </div>
          )}
          {communication.primaryMeeting.trim() && (
            <div className="print-contact-block">
              <h3>Primary meeting place</h3>
              <p>{communication.primaryMeeting.trim()}</p>
            </div>
          )}
          {communication.alternateMeeting.trim() && (
            <div className="print-contact-block">
              <h3>Alternate meeting place</h3>
              <p>{communication.alternateMeeting.trim()}</p>
            </div>
          )}
          {communication.instructions.trim() && (
            <div className="print-contact-block">
              <h3>Household communication instructions</h3>
              <p className="print-user-text">
                {communication.instructions.trim()}
              </p>
            </div>
          )}
          {communication.reunification.trim() && (
            <div className="print-contact-block">
              <h3>Reunification arrangements</h3>
              <p className="print-user-text">
                {communication.reunification.trim()}
              </p>
            </div>
          )}
        </section>
      )}

      <section className="print-section" aria-labelledby="print-resources">
        <h2 id="print-resources">
          {hasCommunication ? "06" : "05"} / Safety reminders & official
          resources
        </h2>
        <ul className="print-reminders">
          <li>
            Follow current instructions from local authorities. Never delay an
            evacuation to complete this plan or gather supplies.
          </li>
          <li>
            Review your plan, contacts, supplies and expiration dates
            periodically.
          </li>
          <li>
            Ask a pharmacist or healthcare professional about appropriate
            medication supplies. For powered medical equipment, consult the
            equipment provider and healthcare team about backup power and
            continuity.
          </li>
          <li>{locationResourceNote(location.country)}</li>
        </ul>
        {resources.length > 0 && (
          <div className="print-resources">
            <h3>Official reference links used in this plan</h3>
            <ul>
              {resources.map((resource) => (
                <li key={resource.url}>
                  <strong>{resource.name}</strong> — {resource.url}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <footer className="print-footer">
        <p>{DISCLAIMER}</p>
        <p>
          FORTIS · Strength Through Preparation. · Stored locally in your
          browser; keep printed copies securely.
        </p>
      </footer>
    </article>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
