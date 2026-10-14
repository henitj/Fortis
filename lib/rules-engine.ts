import {
  HAZARDS,
  HOUSEHOLD_TAG_LABELS,
  PRIORITY_ORDER,
  TASKS,
} from "./preparedness-data";
import type { HouseholdProfile, HouseholdTag, PreparednessTask } from "./types";

export function getHouseholdTags(profile: HouseholdProfile): Set<HouseholdTag> {
  const { household, preferences } = profile;
  const tags = new Set<HouseholdTag>();
  if (household.children > 0) tags.add("children");
  if (household.olderAdults > 0) tags.add("older-adults");
  if (household.pets > 0) tags.add("pets");
  if (household.accessibility) tags.add("accessibility");
  if (household.poweredMedical) tags.add("powered-medical");
  if (household.communicationSupport) tags.add("communication-support");
  tags.add(preferences.vehicle ? "vehicle" : "no-vehicle");
  if (preferences.evacuationAssistance) tags.add("evacuation-assistance");
  return tags;
}

export function getRecommendations(
  profile: HouseholdProfile,
  catalog: PreparednessTask[] = TASKS,
): PreparednessTask[] {
  const tags = getHouseholdTags(profile);
  const matches = catalog.filter(
    (task) =>
      (task.hazardTags.length === 0 ||
        task.hazardTags.some((tag) => profile.hazards.includes(tag))) &&
      (task.householdTags.length === 0 ||
        task.householdTags.some((tag) => tags.has(tag))),
  );
  // A stable ID is counted once even if more than one rule or hazard matches it.
  return [...new Map(matches.map((task) => [task.id, task])).values()];
}

export function getTaskReason(
  task: PreparednessTask,
  profile: HouseholdProfile,
): string {
  const hazards = task.hazardTags
    .filter((tag) => profile.hazards.includes(tag))
    .map((tag) =>
      HAZARDS.find((hazard) => hazard.id === tag)?.label.toLowerCase(),
    )
    .filter(Boolean);
  const tags = getHouseholdTags(profile);
  const household = task.householdTags
    .filter((tag) => tags.has(tag))
    .map((tag) => HOUSEHOLD_TAG_LABELS[tag]);
  const reasons = [...hazards, ...household];
  return reasons.length
    ? `Included for ${reasons.join(" and ")}.`
    : "Included in every household plan.";
}

export function getPriorityTasks(
  tasks: PreparednessTask[],
  states: Record<string, string>,
  limit = 3,
): PreparednessTask[] {
  return tasks
    .filter(
      (task) =>
        states[task.id] !== "done" && states[task.id] !== "not-applicable",
    )
    .sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit);
}
