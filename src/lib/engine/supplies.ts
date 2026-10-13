import type { Profile, SuppliesState, SupplySettings } from "@/lib/schema";
import { derivePeople } from "@/lib/engine/context";

export const GALLONS_PER_PERSON_PER_DAY = 1;
export const HOT_WEATHER_MULTIPLIER = 2;
export const MEALS_PER_PERSON_PER_DAY = 3;
export const LITERS_PER_GALLON = 3.785411784;
/** Default pet-water estimate. Configurable by the user — needs vary widely by species and size. */
export const DEFAULT_PET_WATER_GALLONS_PER_DAY = 0.25;

export const DEFAULT_SUPPLY_SETTINGS: SupplySettings = {
  petWaterGallonsPerDay: DEFAULT_PET_WATER_GALLONS_PER_DAY,
  hotWeatherBuffer: false,
};

export interface WaterCalculation {
  people: number;
  days: number;
  gallonsPerPersonPerDay: number;
  /** people × days × 1 gallon */
  baselineGallons: number;
  multiplier: number;
  /** baseline × multiplier */
  householdGallons: number;
  pets: number;
  petGallonsPerDay: number;
  /** pets × days × per-pet estimate. Calculated separately — pets are never counted as people. */
  petGallons: number;
  totalGallons: number;
}

export function calculateWater(profile: Profile, settings: SupplySettings): WaterCalculation {
  const people = derivePeople(profile);
  const days = profile.preferences.durationDays;
  const baselineGallons = people * days * GALLONS_PER_PERSON_PER_DAY;
  const multiplier = settings.hotWeatherBuffer ? HOT_WEATHER_MULTIPLIER : 1;
  const householdGallons = baselineGallons * multiplier;
  const pets = profile.household.pets;
  const petGallons = roundTo(pets * days * settings.petWaterGallonsPerDay, 2);
  return {
    people,
    days,
    gallonsPerPersonPerDay: GALLONS_PER_PERSON_PER_DAY,
    baselineGallons,
    multiplier,
    householdGallons,
    pets,
    petGallonsPerDay: settings.petWaterGallonsPerDay,
    petGallons,
    totalGallons: roundTo(householdGallons + petGallons, 2),
  };
}

export interface FoodCalculation {
  people: number;
  days: number;
  personDays: number;
  meals: number;
  petDays: number;
}

export function calculateFood(profile: Profile): FoodCalculation {
  const people = derivePeople(profile);
  const days = profile.preferences.durationDays;
  return {
    people,
    days,
    personDays: people * days,
    meals: people * days * MEALS_PER_PERSON_PER_DAY,
    petDays: profile.household.pets * days,
  };
}

export const SUPPLY_CATEGORIES = [
  { id: "water", label: "Water" },
  { id: "food", label: "Food" },
  { id: "first-aid", label: "First aid & medications" },
  { id: "power", label: "Power & lighting" },
  { id: "communication", label: "Communication" },
  { id: "hygiene", label: "Hygiene & sanitation" },
  { id: "documents", label: "Documents & cash" },
  { id: "shelter", label: "Shelter & clothing" },
  { id: "tools", label: "Tools & safety" },
  { id: "care", label: "Family & accessibility" },
  { id: "pets", label: "Pets" },
] as const;

export type SupplyCategoryId = (typeof SUPPLY_CATEGORIES)[number]["id"];

export interface SupplyItem {
  id: string;
  name: string;
  category: SupplyCategoryId;
  unit: string;
  recommended: number;
  /** How the recommended quantity was calculated, in plain language. */
  formula: string;
  note?: string;
  /** True for quantities that are rough estimates (e.g., pet water). */
  estimate?: boolean;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Generate the household's supply list. Pure and deterministic. */
export function generateSupplies(profile: Profile, settings: SupplySettings): SupplyItem[] {
  const water = calculateWater(profile, settings);
  const food = calculateFood(profile);
  const { adults, children, olderAdults, pets } = profile.household;
  const people = water.people;
  const days = water.days;
  const hasVehicle = profile.preferences.hasVehicle === "yes";
  const hazards = new Set(profile.hazards);
  const items: SupplyItem[] = [];
  const add = (item: SupplyItem) => items.push(item);

  // Water
  add({
    id: "water-household",
    name: "Drinking & sanitation water",
    category: "water",
    unit: "gallons",
    recommended: Math.ceil(water.householdGallons),
    formula: `${plural(people, "person", "people")} × ${plural(days, "day")} × 1 gal${water.multiplier > 1 ? ` × ${water.multiplier} (hot weather)` : ""}`,
    note: "Baseline starting point. Heat, illness, activity, pregnancy and nursing can increase needs.",
  });
  if (pets > 0) {
    add({
      id: "water-pets",
      name: "Water for pets",
      category: "water",
      unit: "gallons",
      recommended: Math.ceil(water.petGallons),
      formula: `${plural(pets, "pet")} × ${plural(days, "day")} × ${settings.petWaterGallonsPerDay} gal (estimate)`,
      note: "Estimate only — needs vary by species, size, weather and health. Ask your veterinarian.",
      estimate: true,
    });
  }

  // Food
  add({
    id: "food-meals",
    name: "Non-perishable meals",
    category: "food",
    unit: "meals",
    recommended: food.meals,
    formula: `${food.personDays} person-days × ${MEALS_PER_PERSON_PER_DAY} meals`,
    note: "A planning quantity, not a nutritional guarantee. Choose foods your household will eat and account for special diets.",
  });
  add({ id: "food-can-opener", name: "Manual can opener", category: "food", unit: "openers", recommended: 1, formula: "1 per household" });
  if (children > 0) {
    add({
      id: "food-children",
      name: "Child-friendly foods, formula or snacks",
      category: "food",
      unit: "child-days",
      recommended: children * days,
      formula: `${plural(children, "child", "children")} × ${plural(days, "day")}`,
    });
  }
  if (pets > 0) {
    add({
      id: "food-pets",
      name: "Pet food",
      category: "pets",
      unit: "pet-days",
      recommended: food.petDays,
      formula: `${plural(pets, "pet")} × ${plural(days, "day")}`,
    });
  }

  // First aid & medications
  add({
    id: "first-aid-kit",
    name: "First-aid kit",
    category: "first-aid",
    unit: "kits",
    recommended: hasVehicle ? 2 : 1,
    formula: hasVehicle ? "1 for home + 1 for the vehicle" : "1 per household",
  });
  add({
    id: "medication-plan",
    name: "Medication list & emergency supply",
    category: "first-aid",
    unit: "plan",
    recommended: 1,
    formula: "1 per household",
    note: "Coordinate with a pharmacist or healthcare professional about maintaining an appropriate supply.",
  });
  add({
    id: "otc-medicines",
    name: "Non-prescription medicines",
    category: "first-aid",
    unit: "sets",
    recommended: 1,
    formula: "1 per household",
  });

  // Power & lighting
  add({ id: "flashlights", name: "Flashlights", category: "power", unit: "flashlights", recommended: people, formula: "1 per person" });
  const batterySets = people * (days >= 7 ? 2 : 1);
  add({
    id: "batteries",
    name: "Spare battery sets",
    category: "power",
    unit: "sets",
    recommended: batterySets,
    formula: days >= 7 ? "2 sets per flashlight for plans of 7+ days" : "1 set per flashlight",
  });
  add({ id: "radio", name: "Battery or hand-crank radio", category: "power", unit: "radios", recommended: 1, formula: "1 per household" });
  add({
    id: "power-banks",
    name: "Charged power banks & cables",
    category: "power",
    unit: "power banks",
    recommended: Math.max(1, adults),
    formula: "1 per adult phone user",
  });

  // Communication
  add({ id: "whistles", name: "Whistles (to signal for help)", category: "communication", unit: "whistles", recommended: people, formula: "1 per person" });
  add({
    id: "contact-cards",
    name: "Printed emergency contact cards",
    category: "communication",
    unit: "cards",
    recommended: people,
    formula: "1 per person",
    note: "Print these from the Contacts section.",
  });

  // Hygiene & sanitation
  add({ id: "hygiene-kits", name: "Personal hygiene kits", category: "hygiene", unit: "kits", recommended: people, formula: "1 per person" });
  add({
    id: "sanitation",
    name: "Sanitation supplies (garbage bags, ties, moist towelettes)",
    category: "hygiene",
    unit: "kits",
    recommended: Math.ceil(days / 7),
    formula: "1 kit per week of planning",
  });

  // Documents & cash
  add({ id: "document-container", name: "Waterproof document container", category: "documents", unit: "containers", recommended: 1, formula: "1 per household" });
  add({ id: "document-copies", name: "Copies of important documents", category: "documents", unit: "sets", recommended: 1, formula: "1 per household" });
  add({
    id: "cash",
    name: "Cash in small bills",
    category: "documents",
    unit: "reserve",
    recommended: 1,
    formula: "1 reserve per household",
    note: "The right amount depends on your circumstances. Not everyone can stock up at once — build supplies gradually.",
  });

  // Shelter & clothing
  add({ id: "blankets", name: "Warm blankets or sleeping bags", category: "shelter", unit: "blankets", recommended: people, formula: "1 per person" });
  add({ id: "clothing", name: "Change of clothes & sturdy shoes", category: "shelter", unit: "sets", recommended: people, formula: "1 per person" });
  add({ id: "sheeting", name: "Plastic sheeting, scissors & duct tape", category: "shelter", unit: "kits", recommended: 1, formula: "1 per household" });

  // Tools & safety
  const masksPerPerson = hazards.has("wildfires") ? 2 : 1;
  add({
    id: "masks",
    name: hazards.has("wildfires") ? "N95 masks" : "Dust masks",
    category: "tools",
    unit: "masks",
    recommended: people * masksPerPerson,
    formula: hazards.has("wildfires") ? "2 per person (wildfire smoke)" : "1 per person",
  });
  add({ id: "wrench", name: "Wrench or pliers (utility shutoff)", category: "tools", unit: "tools", recommended: 1, formula: "1 per household" });
  add({ id: "fire-extinguisher", name: "Fire extinguisher", category: "tools", unit: "extinguishers", recommended: 1, formula: "1 per household" });
  add({ id: "maps", name: "Local paper maps", category: "tools", unit: "maps", recommended: 1, formula: "1 per household" });
  if (hasVehicle) {
    add({
      id: "car-kit",
      name: "Car emergency kit",
      category: "tools",
      unit: "kits",
      recommended: 1,
      formula: "1 per vehicle",
      note: hazards.has("extreme-cold") ? "Add sand, warm clothes and blankets for winter." : undefined,
    });
  }

  // Family & accessibility
  if (children > 0) {
    add({ id: "child-comfort", name: "Comfort items & activities", category: "care", unit: "kits", recommended: children, formula: "1 per child" });
    add({
      id: "infant-supplies",
      name: "Diapers, wipes & infant supplies",
      category: "care",
      unit: "sets",
      recommended: 1,
      formula: "1 per household with young children",
      note: "Set the target to 0 if you don't need these.",
    });
  }
  if (olderAdults > 0) {
    add({
      id: "older-spares",
      name: "Spare eyeglasses & hearing-aid batteries",
      category: "care",
      unit: "sets",
      recommended: olderAdults,
      formula: "1 per older adult",
    });
  }
  if (profile.household.mobilityNeeds === "yes") {
    add({
      id: "mobility-backups",
      name: "Mobility-device backups (spare batteries, patch kit)",
      category: "care",
      unit: "sets",
      recommended: 1,
      formula: "1 per household",
    });
  }
  if (profile.household.communicationNeeds === "yes") {
    add({
      id: "communication-aids",
      name: "Communication cards & assistive-device chargers",
      category: "care",
      unit: "sets",
      recommended: 1,
      formula: "1 per household",
    });
  }
  if (profile.household.poweredMedical === "yes") {
    add({
      id: "medical-backup-power",
      name: "Backup power plan for medical equipment",
      category: "care",
      unit: "plan",
      recommended: 1,
      formula: "1 per household",
      note: "Consult the equipment provider and healthcare team about safe backup power and continuity plans.",
    });
  }

  // Pets
  if (pets > 0) {
    add({ id: "pet-carriers", name: "Pet carriers or leashes", category: "pets", unit: "carriers", recommended: pets, formula: "1 per pet" });
    add({
      id: "pet-supplies",
      name: "Pet medications, records & sanitation",
      category: "pets",
      unit: "kits",
      recommended: pets,
      formula: "1 per pet",
    });
  }

  return items;
}

export type SupplyStatus = "available" | "partial" | "needed" | "skipped";

export interface ResolvedSupply extends SupplyItem {
  target: number;
  onHand: number;
  isCustomTarget: boolean;
  status: SupplyStatus;
}

export function resolveSupply(item: SupplyItem, state: SuppliesState): ResolvedSupply {
  const custom = state.targets[item.id];
  const target = custom ?? item.recommended;
  const onHand = state.onHand[item.id] ?? 0;
  let status: SupplyStatus;
  if (target === 0) status = "skipped";
  else if (onHand >= target) status = "available";
  else if (onHand > 0) status = "partial";
  else status = "needed";
  return { ...item, target, onHand, isCustomTarget: custom !== undefined && custom !== item.recommended, status };
}

export interface SupplySummary {
  /** Items with a target above zero. */
  planned: number;
  available: number;
  needed: number;
  percentage: number | null;
  byCategory: Array<{ id: SupplyCategoryId; label: string; planned: number; available: number }>;
}

export function summarizeSupplies(items: readonly ResolvedSupply[]): SupplySummary {
  const counted = items.filter((i) => i.status !== "skipped");
  const available = counted.filter((i) => i.status === "available").length;
  const byCategory = SUPPLY_CATEGORIES.map((cat) => {
    const inCat = counted.filter((i) => i.category === cat.id);
    return {
      id: cat.id,
      label: cat.label,
      planned: inCat.length,
      available: inCat.filter((i) => i.status === "available").length,
    };
  }).filter((c) => c.planned > 0);
  return {
    planned: counted.length,
    available,
    needed: counted.length - available,
    percentage: counted.length === 0 ? null : Math.floor((available / counted.length) * 100),
    byCategory,
  };
}

export function gallonsToLiters(gallons: number): number {
  return roundTo(gallons * LITERS_PER_GALLON, 1);
}

export function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function formatNumber(value: number, maxDecimals = 2): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: maxDecimals });
}
