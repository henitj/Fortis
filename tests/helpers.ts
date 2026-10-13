import type { Profile } from "@/lib/schema";
import { DEFAULT_PROFILE } from "@/lib/plan";

type DeepPartialProfile = {
  location?: Partial<Profile["location"]>;
  household?: Partial<Profile["household"]>;
  hazards?: Profile["hazards"];
  preferences?: Partial<Profile["preferences"]>;
};

export function makeProfile(overrides: DeepPartialProfile = {}): Profile {
  return {
    location: { ...DEFAULT_PROFILE.location, ...overrides.location },
    household: { ...DEFAULT_PROFILE.household, ...overrides.household },
    hazards: overrides.hazards ?? [],
    preferences: { ...DEFAULT_PROFILE.preferences, ...overrides.preferences },
  };
}
