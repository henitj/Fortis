import type {
  HouseholdProfile,
  SupplyCategory,
  SupplyId,
  SupplySettings,
} from "./types";

export const SUPPLY_CATEGORIES: { id: SupplyCategory; label: string }[] = [
  { id: "water-food", label: "Water & food" },
  { id: "health-hygiene", label: "Health & hygiene" },
  { id: "power-essentials", label: "Power & essentials" },
  { id: "documents-communication", label: "Documents & communication" },
  { id: "pets-accessibility", label: "Pets & accessibility" },
];

export interface SupplyRow {
  id: SupplyId;
  title: string;
  category: SupplyCategory;
  unit: string;
  baseline: number;
  planned: number;
  available: number;
  remaining: number;
  note: string;
  custom: boolean;
  decimal: boolean;
}

export interface SupplyMath {
  people: number;
  days: number;
  personDays: number;
  baselineWaterGallons: number;
  suggestedMeals: number;
  petWaterGallons: number;
  petGallonsPerDay: number;
}

// Invalid numeric inputs never create negative or infinite supply recommendations.
export function safeQuantity(value: number, max = 100000): number {
  return Number.isFinite(value) && value >= 0
    ? Math.min(Math.round(value * 100) / 100, max)
    : 0;
}

export function getSupplyMath(
  profile: HouseholdProfile,
  petGallonsPerDay = 0.5,
): SupplyMath {
  const people = safeQuantity(
    profile.household.adults + profile.household.children,
  );
  const days = safeQuantity(profile.preferences.days);
  const pets = safeQuantity(profile.household.pets);
  const estimate = safeQuantity(petGallonsPerDay, 5);
  const personDays = people * days;
  return {
    people,
    days,
    personDays,
    baselineWaterGallons: personDays, // >= 1 gallon per person per day, including basic use.
    suggestedMeals: personDays * 3, // Planning count, not a nutritional prescription.
    petWaterGallons: Math.round(pets * days * estimate * 100) / 100,
    petGallonsPerDay: estimate,
  };
}

interface SupplyDefinition {
  id: SupplyId;
  title: string;
  category: SupplyCategory;
  unit: string;
  note: string;
  decimal?: boolean;
  baseline: (profile: HouseholdProfile, math: SupplyMath) => number;
  include?: (profile: HouseholdProfile) => boolean;
}

const DEFINITIONS: SupplyDefinition[] = [
  {
    id: "people-water",
    title: "Water for people",
    category: "water-food",
    unit: "gal",
    note: "At least 1 gallon per person per day for drinking and basic use.",
    decimal: true,
    baseline: (_p, m) => m.baselineWaterGallons,
  },
  {
    id: "pet-water",
    title: "Estimated pet water",
    category: "water-food",
    unit: "gal",
    note: "Estimate only. Adjust for species, size, weather and health.",
    decimal: true,
    baseline: (_p, m) => m.petWaterGallons,
    include: (p) => p.household.pets > 0,
  },
  {
    id: "meals",
    title: "Shelf-stable meals",
    category: "water-food",
    unit: "meals",
    note: "Three meal-planning occasions per person-day; not a nutrition assessment.",
    baseline: (_p, m) => m.suggestedMeals,
  },
  {
    id: "first-aid-kits",
    title: "First-aid kits",
    category: "health-hygiene",
    unit: "kits",
    note: "A practical starting point; adapt to your household.",
    baseline: (_p, m) => Math.max(1, Math.ceil(m.people / 5)),
  },
  {
    id: "medication-plan",
    title: "Medication continuity plan",
    category: "health-hygiene",
    unit: "plan",
    note: "Ask a pharmacist or healthcare professional about appropriate supplies.",
    baseline: () => 1,
  },
  {
    id: "hygiene",
    title: "Hygiene supplies",
    category: "health-hygiene",
    unit: "person-days",
    note: "Plan what each person uses each day.",
    baseline: (_p, m) => m.personDays,
  },
  {
    id: "sanitation",
    title: "Sanitation supplies",
    category: "health-hygiene",
    unit: "person-days",
    note: "Consider disposal and cleaning needs.",
    baseline: (_p, m) => m.personDays,
  },
  {
    id: "flashlights",
    title: "Flashlights",
    category: "power-essentials",
    unit: "lights",
    note: "Suggested: about one per two people.",
    baseline: (_p, m) => Math.max(1, Math.ceil(m.people / 2)),
  },
  {
    id: "batteries",
    title: "Spare batteries / charging",
    category: "power-essentials",
    unit: "set",
    note: "Choose a compatible set for your devices.",
    baseline: () => 1,
  },
  {
    id: "backup-chargers",
    title: "Backup phone chargers",
    category: "power-essentials",
    unit: "chargers",
    note: "Suggested: about one per two people.",
    baseline: (_p, m) => Math.max(1, Math.ceil(m.people / 2)),
  },
  {
    id: "document-sets",
    title: "Protected document copies",
    category: "documents-communication",
    unit: "set",
    note: "Store securely; do not expose sensitive copies.",
    baseline: () => 1,
  },
  {
    id: "contact-copies",
    title: "Emergency contact copies",
    category: "documents-communication",
    unit: "copy",
    note: "Keep an accessible copy of your communication plan.",
    baseline: () => 1,
  },
  {
    id: "cash-reserve",
    title: "Cash, if appropriate",
    category: "documents-communication",
    unit: "reserve",
    note: "No amount is prescribed; choose what fits your circumstances.",
    baseline: () => 1,
  },
  {
    id: "pet-carriers",
    title: "Pet carriers / restraints",
    category: "pets-accessibility",
    unit: "carriers",
    note: "Adapt to species and safe transport needs.",
    baseline: (p) => p.household.pets,
    include: (p) => p.household.pets > 0,
  },
  {
    id: "pet-food",
    title: "Pet food",
    category: "pets-accessibility",
    unit: "pet-days",
    note: "Plan food for each pet for each day; adjust to your pets.",
    baseline: (p) => p.household.pets * p.preferences.days,
    include: (p) => p.household.pets > 0,
  },
  {
    id: "accessibility-supplies",
    title: "Essential accessibility supplies",
    category: "pets-accessibility",
    unit: "set",
    note: "Customize to needs without entering medical details.",
    baseline: () => 1,
    include: (p) =>
      p.household.accessibility || p.household.communicationSupport,
  },
  {
    id: "medical-power-plan",
    title: "Equipment power continuity plan",
    category: "pets-accessibility",
    unit: "plan",
    note: "Consult the equipment provider and healthcare team; never assume a standard charger will work.",
    baseline: () => 1,
    include: (p) => p.household.poweredMedical,
  },
];

export const SUPPLY_IDS = DEFINITIONS.map((item) => item.id);

export function getSupplyRows(
  profile: HouseholdProfile,
  settings: SupplySettings,
): SupplyRow[] {
  const math = getSupplyMath(profile, settings.petGallonsPerDay);
  return DEFINITIONS.filter(
    (item) => !item.include || item.include(profile),
  ).map((item) => {
    const state = settings.items[item.id];
    const baseline = safeQuantity(item.baseline(profile, math));
    const custom = state?.plannedOverride !== undefined;
    const planned = custom
      ? safeQuantity(state.plannedOverride ?? baseline)
      : baseline;
    const available = safeQuantity(state?.available ?? 0);
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      unit: item.unit,
      baseline,
      planned,
      available,
      remaining: Math.max(0, Math.round((planned - available) * 100) / 100),
      note: item.note,
      custom,
      decimal: item.decimal ?? false,
    };
  });
}

// Counts items covered, not incompatible units (gallons + kits + meals).
export function getSupplyProgress(rows: SupplyRow[]) {
  const planned = rows.filter((row) => row.planned > 0);
  const available = planned.filter(
    (row) => row.available >= row.planned,
  ).length;
  return {
    total: planned.length,
    available,
    needed: planned.length - available,
  };
}

export function emptySupplySettings(): SupplySettings {
  return { petGallonsPerDay: 0.5, items: {} };
}
