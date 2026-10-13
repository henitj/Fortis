"use client";

import { Card, CardContent } from "@/components/ui/card";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Segmented } from "@/components/ui/segmented";
import { FieldError } from "@/components/ui/field";
import { MAX_PEOPLE_PER_GROUP, MAX_PETS, type Household, type TriState } from "@/lib/schema";
import { Question } from "./question";
import type { StepProps } from "../setup-wizard";

const TRI_OPTIONS: { value: TriState; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unspecified", label: "Prefer not to say" },
];

export function HouseholdStep({ profile, setProfile, errors }: StepProps) {
  const h = profile.household;
  const update = (patch: Partial<Household>) => setProfile((p) => ({ ...p, household: { ...p.household, ...patch } }));
  const people = h.adults + h.children;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="divide-y divide-line">
          <Question id="q-adults" title="Adults" hint="Everyone 18 and older, including older adults.">
            <NumberStepper
              id="adults"
              label="adults"
              value={h.adults}
              max={MAX_PEOPLE_PER_GROUP}
              invalid={Boolean(errors["household.adults"])}
              onChange={(adults) => update({ adults, olderAdults: Math.min(h.olderAdults, adults) })}
            />
          </Question>
          <Question id="q-children" title="Children" hint="Under 18.">
            <NumberStepper id="children" label="children" value={h.children} max={MAX_PEOPLE_PER_GROUP} onChange={(children) => update({ children })} />
          </Question>
          <Question
            id="q-older"
            title="Older adults who may need extra assistance"
            hint="Of the adults above — they're not counted twice."
            why="Adds support-network and personal-supply tasks."
          >
            <NumberStepper
              id="olderAdults"
              label="older adults"
              value={h.olderAdults}
              max={h.adults}
              invalid={Boolean(errors["household.olderAdults"])}
              onChange={(olderAdults) => update({ olderAdults })}
            />
          </Question>
          <Question id="q-pets" title="Pets" why="Adds pet supplies, pet water estimates and pet-friendly evacuation tasks.">
            <NumberStepper id="pets" label="pets" value={h.pets} max={MAX_PETS} onChange={(pets) => update({ pets })} />
          </Question>
          <div className="pt-4">
            <FieldError message={errors["household.adults"] ?? errors["household.olderAdults"]} />
            <p className="text-[13px] text-muted" aria-live="polite">
              Planning for <span className="font-semibold text-navy">{people} {people === 1 ? "person" : "people"}</span>
              {h.pets > 0 ? (
                <>
                  {" "}and <span className="font-semibold text-navy">{h.pets} {h.pets === 1 ? "pet" : "pets"}</span>
                </>
              ) : null}
              .
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-navy">Additional needs</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          These questions are optional. FORTIS never asks for diagnoses, medications or other medical details.
        </p>
      </div>
      <Card>
        <CardContent className="divide-y divide-line">
          <TriQuestion
            id="mobility"
            title="Does anyone have mobility or accessibility needs?"
            why="Adds accessible-evacuation and assistance-planning tasks."
            value={h.mobilityNeeds}
            onChange={(mobilityNeeds) => update({ mobilityNeeds })}
          />
          <TriQuestion
            id="powered"
            title="Does anyone rely on powered medical equipment?"
            why="Adds backup-power and continuity planning with your equipment provider."
            value={h.poweredMedical}
            onChange={(poweredMedical) => update({ poweredMedical })}
          />
          <TriQuestion
            id="communication"
            title="Does anyone need communication assistance?"
            hint="For example, people who are deaf, hard of hearing, blind, or have a speech disability."
            why="Adds accessible-alert and alternative-communication tasks."
            value={h.communicationNeeds}
            onChange={(communicationNeeds) => update({ communicationNeeds })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function TriQuestion({
  id,
  title,
  hint,
  why,
  value,
  onChange,
}: {
  id: string;
  title: string;
  hint?: string;
  why: string;
  value: TriState;
  onChange: (v: TriState) => void;
}) {
  return (
    <Question id={`q-${id}`} title={title} hint={hint} why={why} optional className="sm:[&>div]:flex-col sm:[&>div]:gap-4">
      <Segmented name={id} value={value} options={TRI_OPTIONS} onChange={onChange} aria-labelledby={`q-${id}-label`} className="w-full sm:w-[26rem]" />
    </Question>
  );
}
