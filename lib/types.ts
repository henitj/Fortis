export const HAZARD_IDS = [
  "storms",
  "flooding",
  "wildfires",
  "heat",
  "cold",
  "outages",
  "earthquakes",
  "hurricanes",
] as const;
export type Hazard = (typeof HAZARD_IDS)[number];

export const TASK_CATEGORY_IDS = [
  "water-food",
  "first-aid",
  "communication",
  "documents",
  "power-lighting",
  "evacuation",
  "home-safety",
  "children-older",
  "accessibility",
  "pets",
  "hazards",
] as const;
export type TaskCategory = (typeof TASK_CATEGORY_IDS)[number];
export type Priority = "essential" | "important" | "recommended";
export type HouseholdTag =
  | "children"
  | "older-adults"
  | "pets"
  | "accessibility"
  | "powered-medical"
  | "communication-support"
  | "vehicle"
  | "no-vehicle"
  | "evacuation-assistance";

export interface PreparednessTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  hazardTags: Hazard[];
  householdTags: HouseholdTag[];
  officialUrl?: string;
  estimatedMinutes?: number;
}

export type Country = "" | "US" | "CA" | "OTHER";
export type PlanningDays = 3 | 7 | 14;
export type DetailLevel = "concise" | "detailed";

export interface HouseholdProfile {
  location: { country: Country; region: string; locality: string };
  household: {
    adults: number;
    children: number;
    olderAdults: number; // Already included in adults; never counted again.
    pets: number;
    accessibility: boolean;
    poweredMedical: boolean;
    communicationSupport: boolean;
  };
  hazards: Hazard[];
  preferences: {
    days: PlanningDays;
    vehicle: boolean;
    evacuationAssistance: boolean;
    detail: DetailLevel;
  };
}

export type TaskStatus = "todo" | "done" | "not-applicable";

export const SUPPLY_CATEGORY_IDS = [
  "water-food",
  "health-hygiene",
  "power-essentials",
  "documents-communication",
  "pets-accessibility",
] as const;
export type SupplyCategory = (typeof SUPPLY_CATEGORY_IDS)[number];
export type SupplyId =
  | "people-water"
  | "pet-water"
  | "meals"
  | "first-aid-kits"
  | "medication-plan"
  | "flashlights"
  | "batteries"
  | "backup-chargers"
  | "hygiene"
  | "sanitation"
  | "document-sets"
  | "contact-copies"
  | "cash-reserve"
  | "pet-carriers"
  | "pet-food"
  | "accessibility-supplies"
  | "medical-power-plan";

export interface SupplySettings {
  petGallonsPerDay: number;
  items: Partial<
    Record<SupplyId, { plannedOverride?: number; available: number }>
  >;
}

export interface Contact {
  id: string;
  label: string;
  phone: string;
}

export interface CommunicationPlan {
  contacts: Contact[];
  outOfAreaName: string;
  outOfAreaPhone: string;
  primaryMeeting: string;
  alternateMeeting: string;
  instructions: string;
  reunification: string;
}

export interface StoredPlan {
  schemaVersion: 1;
  profile: HouseholdProfile;
  taskStates: Record<string, TaskStatus>;
  supplies: SupplySettings;
  communication: CommunicationPlan;
  createdAt: string;
  updatedAt: string;
}
