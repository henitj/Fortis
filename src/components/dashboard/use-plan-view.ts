"use client";

import { useMemo } from "react";
import type { StoredPlan } from "@/lib/schema";
import { generateTasks, type GeneratedTask } from "@/lib/engine/tasks";
import { computeReadiness, type ReadinessSummary } from "@/lib/engine/readiness";
import {
  calculateFood,
  calculateWater,
  generateSupplies,
  resolveSupply,
  summarizeSupplies,
  type FoodCalculation,
  type ResolvedSupply,
  type SupplySummary,
  type WaterCalculation,
} from "@/lib/engine/supplies";
import { getLocationGuidance, type LocationGuidance } from "@/lib/data/locations";

export interface PlanView {
  plan: StoredPlan;
  tasks: GeneratedTask[];
  readiness: ReadinessSummary;
  nextTasks: GeneratedTask[];
  supplies: ResolvedSupply[];
  supplySummary: SupplySummary;
  water: WaterCalculation;
  food: FoodCalculation;
  guidance: LocationGuidance;
  communication: { contacts: number; outOfArea: boolean; meetingPlaces: number; complete: boolean };
}

/** Everything on the dashboard is derived from the stored plan — nothing is hardcoded. */
export function buildPlanView(plan: StoredPlan): PlanView {
  const tasks = generateTasks(plan.profile);
  const readiness = computeReadiness(
    tasks.map((t) => t.id),
    plan.taskStatus,
  );
  const nextTasks = tasks.filter((t) => !plan.taskStatus[t.id]);
  const supplies = generateSupplies(plan.profile, plan.supplies.settings).map((item) => resolveSupply(item, plan.supplies));
  const c = plan.communication;
  const contacts = c.contacts.filter((x) => x.label.trim() || x.phone.trim()).length;
  const outOfArea = Boolean(c.outOfArea.name.trim() && c.outOfArea.phone.trim());
  const meetingPlaces = [c.meetingPlaces.primary, c.meetingPlaces.alternate].filter((m) => m.name.trim()).length;
  return {
    plan,
    tasks,
    readiness,
    nextTasks,
    supplies,
    supplySummary: summarizeSupplies(supplies),
    water: calculateWater(plan.profile, plan.supplies.settings),
    food: calculateFood(plan.profile),
    guidance: getLocationGuidance(plan.profile.location.country, plan.profile.location.region),
    communication: { contacts, outOfArea, meetingPlaces, complete: contacts > 0 && outOfArea && meetingPlaces === 2 },
  };
}

export function usePlanView(plan: StoredPlan): PlanView {
  return useMemo(() => buildPlanView(plan), [plan]);
}
