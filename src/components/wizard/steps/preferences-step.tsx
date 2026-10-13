"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import type { Preferences } from "@/lib/schema";
import { Question } from "./question";
import type { StepProps } from "../setup-wizard";

export function PreferencesStep({ profile, setProfile }: StepProps) {
  const p = profile.preferences;
  const update = (patch: Partial<Preferences>) => setProfile((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));
  const stacked = "sm:[&>div]:flex-col sm:[&>div]:gap-4";

  return (
    <div className="space-y-5">
      <p className="max-w-xl leading-relaxed text-navy-600">You can change any of these later from your dashboard.</p>
      <Card>
        <CardContent className="divide-y divide-line">
          <Question
            id="q-duration"
            title="Planning duration"
            hint="How many days of supplies to plan for. Ready.gov recommends supplies for several days."
            className={stacked}
          >
            <Segmented
              name="duration"
              value={p.durationDays}
              onChange={(durationDays) => update({ durationDays })}
              aria-labelledby="q-duration-label"
              className="w-full sm:w-[26rem]"
              options={[
                { value: 3, label: "3 days", hint: "Short disruption" },
                { value: 7, label: "7 days", hint: "Extended" },
                { value: 14, label: "14 days", hint: "Long-term" },
              ]}
            />
          </Question>
          <Question id="q-vehicle" title="Is a vehicle available for evacuation?" why="Switches between car-kit tasks and transportation-planning tasks." className={stacked}>
            <Segmented
              name="vehicle"
              value={p.hasVehicle}
              onChange={(hasVehicle) => update({ hasVehicle })}
              aria-labelledby="q-vehicle-label"
              className="w-full sm:w-[26rem]"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </Question>
          <Question
            id="q-assist"
            title="Might anyone need help evacuating?"
            why="Adds tasks for arranging assistance and asking local officials about support."
            className={stacked}
          >
            <Segmented
              name="assist"
              value={p.evacuationAssistance}
              onChange={(evacuationAssistance) => update({ evacuationAssistance })}
              aria-labelledby="q-assist-label"
              className="w-full sm:w-[26rem]"
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "unsure", label: "Not sure" },
              ]}
            />
          </Question>
          <Question id="q-detail" title="Plan style" className={stacked}>
            <Segmented
              name="detail"
              value={p.detailLevel}
              onChange={(detailLevel) => update({ detailLevel })}
              aria-labelledby="q-detail-label"
              className="w-full sm:w-[26rem]"
              options={[
                { value: "concise", label: "Concise", hint: "Essential tasks" },
                { value: "detailed", label: "Detailed", hint: "Adds extra steps" },
              ]}
            />
          </Question>
        </CardContent>
      </Card>
    </div>
  );
}
