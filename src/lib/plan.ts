import type { Communication, Profile, StoredPlan } from "@/lib/schema";
import { PLAN_SCHEMA_VERSION } from "@/lib/schema";
import { ENGINE_VERSION, diffTaskIds, generateTasks, type RegenerationDiff } from "@/lib/engine/tasks";
import { DEFAULT_SUPPLY_SETTINGS } from "@/lib/engine/supplies";

export const EMPTY_COMMUNICATION: Communication = {
  contacts: [],
  outOfArea: { name: "", phone: "", note: "" },
  meetingPlaces: {
    primary: { name: "", details: "" },
    alternate: { name: "", details: "" },
  },
  instructions: "",
  reunification: "",
};

export const DEFAULT_PROFILE: Profile = {
  location: { country: "US", region: "", locality: "" },
  household: {
    adults: 2,
    children: 0,
    olderAdults: 0,
    pets: 0,
    mobilityNeeds: "unspecified",
    poweredMedical: "unspecified",
    communicationNeeds: "unspecified",
  },
  hazards: [],
  preferences: {
    durationDays: 7,
    hasVehicle: "yes",
    evacuationAssistance: "no",
    detailLevel: "concise",
  },
};

export function createPlan(profile: Profile, now: Date = new Date()): StoredPlan {
  const iso = now.toISOString();
  return {
    schemaVersion: PLAN_SCHEMA_VERSION,
    engineVersion: ENGINE_VERSION,
    createdAt: iso,
    updatedAt: iso,
    generatedAt: iso,
    profile,
    generatedTaskIds: generateTasks(profile).map((t) => t.id),
    taskStatus: {},
    supplies: {
      targets: {},
      onHand: {},
      // Suggest the hot-weather buffer for households preparing for extreme heat.
      settings: { ...DEFAULT_SUPPLY_SETTINGS, hotWeatherBuffer: profile.hazards.includes("extreme-heat") },
    },
    communication: EMPTY_COMMUNICATION,
  };
}

/**
 * Re-run the rules engine for an edited profile. Task completion, supply
 * quantities and communication details are preserved (keyed by stable IDs).
 */
export function regeneratePlan(
  plan: StoredPlan,
  profile: Profile,
  now: Date = new Date(),
): { plan: StoredPlan; diff: RegenerationDiff } {
  const nextIds = generateTasks(profile).map((t) => t.id);
  const diff = diffTaskIds(plan.generatedTaskIds, nextIds);
  const iso = now.toISOString();
  const addedHeat = profile.hazards.includes("extreme-heat") && !plan.profile.hazards.includes("extreme-heat");
  return {
    diff,
    plan: {
      ...plan,
      engineVersion: ENGINE_VERSION,
      profile,
      generatedTaskIds: nextIds,
      generatedAt: iso,
      updatedAt: iso,
      supplies: addedHeat
        ? { ...plan.supplies, settings: { ...plan.supplies.settings, hotWeatherBuffer: true } }
        : plan.supplies,
    },
  };
}
