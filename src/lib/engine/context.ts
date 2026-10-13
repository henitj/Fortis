import type { HazardId, Profile } from "@/lib/schema";
import type { HouseholdTag } from "@/lib/data/tasks";

export interface HouseholdContext {
  /** Headcount used for water and food: adults + children. Older adults are already among adults. */
  people: number;
  adults: number;
  children: number;
  olderAdults: number;
  pets: number;
  days: number;
  hazards: ReadonlySet<HazardId>;
  tags: ReadonlySet<HouseholdTag>;
  detailed: boolean;
}

export function derivePeople(profile: Pick<Profile, "household">): number {
  return profile.household.adults + profile.household.children;
}

export function deriveContext(profile: Profile): HouseholdContext {
  const h = profile.household;
  const p = profile.preferences;
  const tags = new Set<HouseholdTag>();

  if (h.children > 0) tags.add("children");
  if (h.olderAdults > 0) tags.add("older-adults");
  if (h.pets > 0) tags.add("pets");
  if (h.mobilityNeeds === "yes") tags.add("mobility");
  if (h.poweredMedical === "yes") tags.add("powered-medical");
  if (h.communicationNeeds === "yes") tags.add("communication");
  tags.add(p.hasVehicle === "yes" ? "vehicle" : "no-vehicle");
  if (p.evacuationAssistance !== "no") tags.add("evacuation-assistance");
  if (derivePeople(profile) > 1) tags.add("multi-person");

  return {
    people: derivePeople(profile),
    adults: h.adults,
    children: h.children,
    olderAdults: h.olderAdults,
    pets: h.pets,
    days: p.durationDays,
    hazards: new Set(profile.hazards),
    tags,
    detailed: p.detailLevel === "detailed",
  };
}

/** Human-readable reason fragments for household tags, used in "Why is this here?" explanations. */
export const TAG_REASON: Record<HouseholdTag, string> = {
  children: "your household includes children",
  "older-adults": "your household includes older adults who may need assistance",
  pets: "your household includes pets",
  mobility: "someone has mobility or accessibility needs",
  "powered-medical": "someone relies on powered medical equipment",
  communication: "someone needs communication assistance",
  vehicle: "you have a vehicle available",
  "no-vehicle": "you don't have a vehicle available",
  "evacuation-assistance": "you indicated evacuation assistance may be needed",
  "multi-person": "your household has more than one person",
};
