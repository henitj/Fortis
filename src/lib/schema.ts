import { z } from "zod";

/**
 * Runtime schemas are the single source of truth for FORTIS data shapes.
 * TypeScript types are inferred from them, so stored data, imported files and
 * wizard input are all validated against exactly the same rules.
 */

export const HAZARD_IDS = [
  "severe-storms",
  "flooding",
  "wildfires",
  "extreme-heat",
  "extreme-cold",
  "power-outages",
  "earthquakes",
  "hurricanes",
] as const;

export const COUNTRY_CODES = ["US", "CA", "GB", "OTHER", "UNSPECIFIED"] as const;
export const DURATIONS = [3, 7, 14] as const;
export const TRI_STATE = ["yes", "no", "unspecified"] as const;

export const MAX_PEOPLE_PER_GROUP = 20;
export const MAX_PETS = 20;

export const hazardIdSchema = z.enum(HAZARD_IDS);
export const triStateSchema = z.enum(TRI_STATE);

const count = (max: number, label: string) =>
  z
    .number({ error: `Enter a number for ${label}.` })
    .int(`${label} must be a whole number.`)
    .min(0, `${label} can't be negative.`)
    .max(max, `FORTIS supports up to ${max} ${label.toLowerCase()}.`);

export const locationSchema = z.object({
  country: z.enum(COUNTRY_CODES),
  /** Region / state / province code. Empty string when not provided. */
  region: z.string().max(80),
  /** Optional city or postal code — stored only so the user can see it on their plan. */
  locality: z.string().trim().max(80, "Keep the city or postal code under 80 characters."),
});

export const householdSchema = z
  .object({
    adults: count(MAX_PEOPLE_PER_GROUP, "Adults"),
    children: count(MAX_PEOPLE_PER_GROUP, "Children"),
    /** Subset of `adults` — never added to the headcount a second time. */
    olderAdults: count(MAX_PEOPLE_PER_GROUP, "Older adults"),
    pets: count(MAX_PETS, "Pets"),
    mobilityNeeds: triStateSchema,
    poweredMedical: triStateSchema,
    communicationNeeds: triStateSchema,
  })
  .superRefine((h, ctx) => {
    if (h.adults + h.children < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["adults"],
        message: "Add at least one person to your household.",
      });
    }
    if (h.olderAdults > h.adults) {
      ctx.addIssue({
        code: "custom",
        path: ["olderAdults"],
        message: "Older adults are counted within the adults total, so this can't exceed the number of adults.",
      });
    }
  });

export const preferencesSchema = z.object({
  durationDays: z.union([z.literal(3), z.literal(7), z.literal(14)]),
  hasVehicle: z.enum(["yes", "no"]),
  evacuationAssistance: z.enum(["yes", "no", "unsure"]),
  detailLevel: z.enum(["concise", "detailed"]),
});

export const profileSchema = z.object({
  location: locationSchema,
  household: householdSchema,
  hazards: z
    .array(hazardIdSchema)
    .max(HAZARD_IDS.length)
    .refine((list) => new Set(list).size === list.length, "Each hazard can only be selected once."),
  preferences: preferencesSchema,
});

export const taskStatusSchema = z.enum(["done", "na"]);

export const supplySettingsSchema = z.object({
  /** Configurable pet-water estimate, gallons per pet per day. */
  petWaterGallonsPerDay: z.number().min(0).max(5),
  /** Ready.gov notes water needs can double in very hot temperatures. */
  hotWeatherBuffer: z.boolean(),
});

const quantity = z.number().int().min(0).max(9999);

export const suppliesStateSchema = z.object({
  /** User overrides of the recommended target quantity, keyed by supply ID. */
  targets: z.record(z.string().max(64), quantity),
  /** Quantity the household already has, keyed by supply ID. */
  onHand: z.record(z.string().max(64), quantity),
  settings: supplySettingsSchema,
});

const shortText = (max: number) => z.string().max(max);

export const contactSchema = z.object({
  id: z.string().min(1).max(40),
  label: shortText(80),
  phone: shortText(40),
  note: shortText(160),
});

export const meetingPlaceSchema = z.object({
  name: shortText(120),
  details: shortText(300),
});

export const communicationSchema = z.object({
  contacts: z.array(contactSchema).max(12),
  outOfArea: z.object({ name: shortText(80), phone: shortText(40), note: shortText(160) }),
  meetingPlaces: z.object({ primary: meetingPlaceSchema, alternate: meetingPlaceSchema }),
  instructions: shortText(1200),
  reunification: shortText(1200),
});

export const PLAN_SCHEMA_VERSION = 1 as const;

export const storedPlanSchema = z.object({
  schemaVersion: z.literal(PLAN_SCHEMA_VERSION),
  engineVersion: z.string().max(20),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  generatedAt: z.iso.datetime(),
  profile: profileSchema,
  /** Snapshot of the task IDs produced by the rules engine at generation time. */
  generatedTaskIds: z.array(z.string().max(64)).max(500),
  taskStatus: z.record(z.string().max(64), taskStatusSchema),
  supplies: suppliesStateSchema,
  communication: communicationSchema,
});

export const planExportSchema = z.object({
  app: z.literal("FORTIS"),
  kind: z.literal("plan-export"),
  exportedAt: z.iso.datetime(),
  plan: storedPlanSchema,
});

export type HazardId = z.infer<typeof hazardIdSchema>;
export type CountryCode = (typeof COUNTRY_CODES)[number];
export type TriState = z.infer<typeof triStateSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Household = z.infer<typeof householdSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type SupplySettings = z.infer<typeof supplySettingsSchema>;
export type SuppliesState = z.infer<typeof suppliesStateSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type MeetingPlace = z.infer<typeof meetingPlaceSchema>;
export type Communication = z.infer<typeof communicationSchema>;
export type StoredPlan = z.infer<typeof storedPlanSchema>;
export type PlanExport = z.infer<typeof planExportSchema>;
export type DurationDays = Preferences["durationDays"];

/** Turn a Zod error into a flat `path -> first message` map for form display. */
export function issuesToFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
