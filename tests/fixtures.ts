import type { HouseholdProfile } from "@/lib/types";

export function profile(
  overrides: Partial<HouseholdProfile> = {},
): HouseholdProfile {
  const base: HouseholdProfile = {
    location: { country: "", region: "", locality: "" },
    household: {
      adults: 1,
      children: 0,
      olderAdults: 0,
      pets: 0,
      accessibility: false,
      poweredMedical: false,
      communicationSupport: false,
    },
    hazards: [],
    preferences: {
      days: 3,
      vehicle: true,
      evacuationAssistance: false,
      detail: "concise",
    },
  };
  return {
    ...base,
    ...overrides,
    location: { ...base.location, ...overrides.location },
    household: { ...base.household, ...overrides.household },
    preferences: { ...base.preferences, ...overrides.preferences },
  };
}
