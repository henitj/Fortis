import type { HouseholdProfile, StoredPlan } from "./types";
import { emptySupplySettings } from "./supply-calculations";
import { planSchema } from "./validation";

export const STORAGE_KEY = "fortis:plan:v1";
const OLD_KEYS = ["fortis:plan:v0", "fortis:plan"];

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type LoadResult =
  | { status: "loaded"; plan: StoredPlan }
  | { status: "empty" }
  | { status: "invalid"; reason: string }
  | { status: "unavailable" };

function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function parseStoredPlan(raw: string): LoadResult {
  if (raw.length > 1_000_000)
    return {
      status: "invalid",
      reason: "The saved plan is too large to open safely.",
    };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("schemaVersion" in parsed) ||
      parsed.schemaVersion !== 1
    ) {
      return {
        status: "invalid",
        reason: "This saved plan uses an unsupported version.",
      };
    }
    const result = planSchema.safeParse(parsed);
    if (!result.success)
      return {
        status: "invalid",
        reason: "The saved plan is incomplete or contains invalid data.",
      };
    return { status: "loaded", plan: result.data };
  } catch {
    return { status: "invalid", reason: "The saved plan could not be read." };
  }
}

export function loadPlan(
  storage: StorageLike | null = browserStorage(),
): LoadResult {
  if (!storage) return { status: "unavailable" };
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw !== null) return parseStoredPlan(raw);
    if (OLD_KEYS.some((key) => storage.getItem(key) !== null)) {
      return {
        status: "invalid",
        reason:
          "An older plan format was found and cannot be opened safely. Print or back up old data before clearing it.",
      };
    }
    return { status: "empty" };
  } catch {
    return { status: "unavailable" };
  }
}

export function savePlan(
  plan: StoredPlan,
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage || !planSchema.safeParse(plan).success) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return true;
  } catch {
    return false;
  }
}

export function resetPlan(
  storage: StorageLike | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    for (const key of [STORAGE_KEY, ...OLD_KEYS]) storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function createPlan(
  profile: HouseholdProfile,
  now = new Date().toISOString(),
): StoredPlan {
  return {
    schemaVersion: 1,
    profile,
    taskStates: {},
    supplies: emptySupplySettings(),
    communication: {
      contacts: [],
      outOfAreaName: "",
      outOfAreaPhone: "",
      primaryMeeting: "",
      alternateMeeting: "",
      instructions: "",
      reunification: "",
    },
    createdAt: now,
    updatedAt: now,
  };
}
