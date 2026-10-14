import { z } from "zod";
import { HAZARD_IDS } from "./types";
import { SUPPLY_IDS } from "./supply-calculations";
import type {
  Country,
  DetailLevel,
  Hazard,
  HouseholdProfile,
  PlanningDays,
} from "./types";

const count = z.number().int().min(0).max(30);
const shortText = z.string().max(120);

export const profileSchema = z
  .strictObject({
    location: z.strictObject({
      country: z.enum(["", "US", "CA", "OTHER"]),
      region: shortText,
      locality: shortText,
    }),
    household: z.strictObject({
      adults: count.min(1),
      children: count,
      olderAdults: count,
      pets: count,
      accessibility: z.boolean(),
      poweredMedical: z.boolean(),
      communicationSupport: z.boolean(),
    }),
    hazards: z
      .array(z.enum(HAZARD_IDS))
      .max(HAZARD_IDS.length)
      .refine(
        (hazards) => new Set(hazards).size === hazards.length,
        "Duplicate hazards are not allowed",
      ),
    preferences: z.strictObject({
      days: z.union([z.literal(3), z.literal(7), z.literal(14)]),
      vehicle: z.boolean(),
      evacuationAssistance: z.boolean(),
      detail: z.enum(["concise", "detailed"]),
    }),
  })
  .refine(
    (profile) => profile.household.olderAdults <= profile.household.adults,
    {
      path: ["household", "olderAdults"],
      message: "Older adults must be included in the adult count",
    },
  );

const quantity = z.number().finite().min(0).max(100000);
const supplyItemSchema = z.strictObject({
  plannedOverride: quantity.optional(),
  available: quantity,
});

export const planSchema = z.strictObject({
  schemaVersion: z.literal(1),
  profile: profileSchema,
  taskStates: z
    .record(
      z.string().min(1).max(80),
      z.enum(["todo", "done", "not-applicable"]),
    )
    .refine(
      (states) => Object.keys(states).length <= 200,
      "Too many task states",
    ),
  supplies: z.strictObject({
    petGallonsPerDay: z.number().finite().min(0.05).max(5),
    items: z
      .record(z.string(), supplyItemSchema)
      .refine(
        (items) =>
          Object.keys(items).length <= 30 &&
          Object.keys(items).every((id) =>
            SUPPLY_IDS.includes(id as (typeof SUPPLY_IDS)[number]),
          ),
        "Unknown or excessive supply items",
      ),
  }),
  communication: z.strictObject({
    contacts: z
      .array(
        z.strictObject({
          id: z.string().min(1).max(100),
          label: z.string().max(80),
          phone: z.string().max(60),
        }),
      )
      .max(15)
      .refine(
        (contacts) =>
          new Set(contacts.map((contact) => contact.id)).size ===
          contacts.length,
        "Duplicate contacts are not allowed",
      ),
    outOfAreaName: z.string().max(80),
    outOfAreaPhone: z.string().max(60),
    primaryMeeting: z.string().max(200),
    alternateMeeting: z.string().max(200),
    instructions: z.string().max(1000),
    reunification: z.string().max(1000),
  }),
  createdAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
  updatedAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
});

export interface ProfileDraft {
  country: Country;
  region: string;
  locality: string;
  adults: string;
  children: string;
  olderAdults: string;
  pets: string;
  accessibility: boolean;
  poweredMedical: boolean;
  communicationSupport: boolean;
  hazards: Hazard[];
  days: PlanningDays;
  vehicle: boolean | null;
  evacuationAssistance: boolean;
  detail: DetailLevel;
}

export function newDraft(): ProfileDraft {
  return {
    country: "",
    region: "",
    locality: "",
    adults: "1",
    children: "0",
    olderAdults: "0",
    pets: "0",
    accessibility: false,
    poweredMedical: false,
    communicationSupport: false,
    hazards: [],
    days: 3,
    vehicle: null,
    evacuationAssistance: false,
    detail: "concise",
  };
}

export function draftFromProfile(profile: HouseholdProfile): ProfileDraft {
  return {
    country: profile.location.country,
    region: profile.location.region,
    locality: profile.location.locality,
    adults: String(profile.household.adults),
    children: String(profile.household.children),
    olderAdults: String(profile.household.olderAdults),
    pets: String(profile.household.pets),
    accessibility: profile.household.accessibility,
    poweredMedical: profile.household.poweredMedical,
    communicationSupport: profile.household.communicationSupport,
    hazards: [...profile.hazards],
    days: profile.preferences.days,
    vehicle: profile.preferences.vehicle,
    evacuationAssistance: profile.preferences.evacuationAssistance,
    detail: profile.preferences.detail,
  };
}

export type DraftErrors = Partial<Record<keyof ProfileDraft, string>>;

function validateCount(
  value: string,
  label: string,
  min: number,
): string | undefined {
  if (!/^\d+$/.test(value.trim()))
    return `Enter a whole number for ${label.toLowerCase()}.`;
  const count = Number(value);
  if (count < min || count > 30)
    return `${label} must be between ${min} and 30.`;
  return undefined;
}

export function validateWizardStep(
  draft: ProfileDraft,
  step: number,
): DraftErrors {
  const errors: DraftErrors = {};
  if (step === 0) {
    if (draft.region.trim().length > 120)
      errors.region = "Keep the state or region under 120 characters.";
    if (draft.locality.trim().length > 120)
      errors.locality = "Keep the city or postal code under 120 characters.";
  }
  if (step === 1) {
    errors.adults = validateCount(draft.adults, "Adults", 1);
    errors.children = validateCount(draft.children, "Children", 0);
    errors.olderAdults = validateCount(draft.olderAdults, "Older adults", 0);
    errors.pets = validateCount(draft.pets, "Pets", 0);
    if (
      !errors.adults &&
      !errors.olderAdults &&
      Number(draft.olderAdults) > Number(draft.adults)
    ) {
      errors.olderAdults =
        "Include older adults in the adult count above; do not count them twice.";
    }
  }
  if (step === 3 && draft.vehicle === null)
    errors.vehicle = "Choose whether a vehicle is available.";
  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => Boolean(value)),
  ) as DraftErrors;
}

export function draftToProfile(draft: ProfileDraft): HouseholdProfile | null {
  for (const step of [0, 1, 2, 3]) {
    if (Object.keys(validateWizardStep(draft, step)).length > 0) return null;
  }
  const result = profileSchema.safeParse({
    location: {
      country: draft.country,
      region: draft.region.trim(),
      locality: draft.locality.trim(),
    },
    household: {
      adults: Number(draft.adults),
      children: Number(draft.children),
      olderAdults: Number(draft.olderAdults),
      pets: Number(draft.pets),
      accessibility: draft.accessibility,
      poweredMedical: draft.poweredMedical,
      communicationSupport: draft.communicationSupport,
    },
    hazards: draft.hazards,
    preferences: {
      days: draft.days,
      vehicle: draft.vehicle,
      evacuationAssistance: draft.evacuationAssistance,
      detail: draft.detail,
    },
  });
  return result.success ? result.data : null;
}
