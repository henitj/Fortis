import type { HazardId } from "@/lib/schema";
import type { ResourceId } from "@/lib/data/resources";
import type { Priority, TaskCategoryId } from "@/lib/data/categories";

/** Facts about a household that tasks can depend on. Derived in `engine/context.ts`. */
export const HOUSEHOLD_TAGS = [
  "children",
  "older-adults",
  "pets",
  "mobility",
  "powered-medical",
  "communication",
  "vehicle",
  "no-vehicle",
  "evacuation-assistance",
  "multi-person",
] as const;
export type HouseholdTag = (typeof HOUSEHOLD_TAGS)[number];

export interface TaskDefinition {
  /** Stable ID. Never reuse or rename — completion state is keyed by it. */
  id: string;
  title: string;
  description: string;
  category: TaskCategoryId;
  priority: Priority;
  /** Included only when at least one of these hazards is selected. Omit for universal tasks. */
  hazards?: HazardId[];
  /** Included only when every tag applies to the household. */
  requires?: HouseholdTag[];
  /** Included only when at least one tag applies to the household. */
  requiresAny?: HouseholdTag[];
  /** Universal task that is raised one priority level when one of these hazards is selected. */
  emphasizedFor?: HazardId[];
  /** Omitted from concise plans. */
  detailOnly?: boolean;
  reference?: ResourceId;
  /** Rough estimate of hands-on time, in minutes. */
  minutes?: number;
}

/**
 * The FORTIS task library. Guidance is paraphrased from the referenced
 * official sources. Tasks that apply to several hazards are written once and
 * tagged with every relevant hazard, which keeps plans free of duplicates.
 */
export const TASKS: TaskDefinition[] = [
  // ───────────── Water & food ─────────────
  {
    id: "core-water-supply",
    title: "Store drinking water for everyone",
    description:
      "Set aside at least one gallon per person per day for drinking and sanitation for your full planning period. Your exact total is in the Supply Calculator.",
    category: "water-food",
    priority: "critical",
    reference: "ready-water",
    minutes: 30,
  },
  {
    id: "core-food-supply",
    title: "Stock non-perishable food your household will eat",
    description:
      "Choose foods that need no refrigeration, cooking or extra water, account for special diets, and include a manual can opener.",
    category: "water-food",
    priority: "critical",
    reference: "ready-food",
    minutes: 45,
  },
  {
    id: "core-supply-rotation",
    title: "Schedule a twice-yearly supply check",
    description:
      "Set a recurring reminder to replace expired food, rotate water that isn't commercially bottled, and update the kit as your needs change.",
    category: "water-food",
    priority: "recommended",
    detailOnly: true,
    reference: "ready-kit",
    minutes: 10,
  },
  {
    id: "heat-extra-water",
    title: "Plan for extra drinking water in hot weather",
    description:
      "Water needs can double in very hot temperatures. Turn on the hot-weather buffer in the Supply Calculator and plan how you will keep water cool and accessible.",
    category: "water-food",
    priority: "high",
    hazards: ["extreme-heat"],
    reference: "ready-water",
    minutes: 15,
  },

  // ───────────── First aid & medications ─────────────
  {
    id: "core-first-aid-kit",
    title: "Assemble a first-aid kit",
    description:
      "Keep a stocked first-aid kit with your emergency supplies, along with common non-prescription medicines your household uses.",
    category: "first-aid",
    priority: "high",
    reference: "ready-kit",
    minutes: 30,
  },
  {
    id: "core-medications",
    title: "Coordinate a medication supply plan",
    description:
      "Ask a pharmacist or healthcare professional how to keep an appropriate emergency supply of prescriptions. Keep a written list of medications, dosages and allergies with your kit.",
    category: "first-aid",
    priority: "critical",
    reference: "ready-kit",
    minutes: 20,
  },
  {
    id: "core-sanitation",
    title: "Gather hygiene and sanitation supplies",
    description:
      "Pack soap, hand sanitizer, moist towelettes, garbage bags and plastic ties, plus personal and feminine hygiene items.",
    category: "first-aid",
    priority: "high",
    reference: "ready-kit",
    minutes: 20,
  },

  // ───────────── Communication ─────────────
  {
    id: "core-alerts",
    title: "Sign up for local emergency alerts",
    description:
      "Find out which alert systems your community uses, turn on emergency alerts on every phone, and consider a weather radio with a tone alert.",
    category: "communication",
    priority: "critical",
    reference: "ready-alerts",
    minutes: 15,
  },
  {
    id: "core-comm-plan",
    title: "Complete your household communication plan",
    description:
      "Fill in contacts, an out-of-area contact and meeting places in the Contacts section, then share the plan with everyone in your household.",
    category: "communication",
    priority: "critical",
    reference: "ready-plan",
    minutes: 20,
  },
  {
    id: "core-out-of-area",
    title: "Choose an out-of-area contact",
    description:
      "Pick someone outside your area who can relay messages. Agree that household members will text them if separated — texts often get through when calls don't.",
    category: "communication",
    priority: "high",
    reference: "ready-plan",
    minutes: 10,
  },
  {
    id: "core-meeting-places",
    title: "Pick two meeting places",
    description:
      "Choose one familiar place near your home and one outside your neighborhood in case you can't return home.",
    category: "communication",
    priority: "high",
    requires: ["multi-person"],
    reference: "ready-plan",
    minutes: 10,
  },
  {
    id: "core-paper-contacts",
    title: "Keep key phone numbers on paper",
    description:
      "Phones can lose power or be lost. Put a printed contact card in your kit, wallet or bag — FORTIS can print one from your plan.",
    category: "communication",
    priority: "high",
    reference: "ready-plan",
    minutes: 10,
  },
  {
    id: "core-neighbors",
    title: "Connect with neighbors",
    description:
      "Talk with nearby neighbors about how you could help each other, and exchange contact details with anyone who may need extra help.",
    category: "communication",
    priority: "recommended",
    detailOnly: true,
    reference: "ready-plan",
    minutes: 20,
  },

  // ───────────── Documents ─────────────
  {
    id: "core-documents",
    title: "Protect copies of important documents",
    description:
      "Keep copies of IDs, insurance policies and bank records in a waterproof, portable container and as password-protected digital copies.",
    category: "documents",
    priority: "high",
    reference: "ready-financial",
    minutes: 45,
  },
  {
    id: "core-cash",
    title: "Keep a small cash reserve",
    description:
      "ATMs and card payments may not work during outages. Keep a modest amount of cash in small bills with your supplies.",
    category: "documents",
    priority: "recommended",
    reference: "ready-financial",
    minutes: 5,
  },
  {
    id: "core-insurance-review",
    title: "Review your insurance coverage",
    description:
      "Check what your policies cover. Standard homeowner's policies typically do not cover flood or earthquake damage.",
    category: "documents",
    priority: "recommended",
    emphasizedFor: ["flooding", "earthquakes", "hurricanes"],
    reference: "ready-financial",
    minutes: 30,
  },
  {
    id: "flood-protect-documents",
    title: "Plan to protect documents and valuables from water",
    description:
      "Store document containers above likely water levels and decide in advance which valuables you would move to a higher floor.",
    category: "documents",
    priority: "high",
    hazards: ["flooding", "hurricanes"],
    reference: "ready-floods",
    minutes: 20,
  },

  // ───────────── Power & lighting ─────────────
  {
    id: "core-flashlights",
    title: "Have a flashlight for every household member",
    description: "Flashlights are safer than candles. Store them where you can find them in the dark, with spare batteries.",
    category: "power-lighting",
    priority: "high",
    emphasizedFor: ["power-outages"],
    reference: "ready-power-outages",
    minutes: 15,
  },
  {
    id: "core-charging",
    title: "Prepare backup charging for phones",
    description:
      "Keep a charged power bank and cables for each phone user, and recharge them on a regular schedule.",
    category: "power-lighting",
    priority: "high",
    emphasizedFor: ["power-outages", "wildfires"],
    reference: "ready-power-outages",
    minutes: 10,
  },
  {
    id: "core-radio",
    title: "Get a battery-powered or hand-crank radio",
    description: "A radio keeps you informed when phone networks or power fail. A NOAA Weather Radio with tone alert is ideal in the U.S.",
    category: "power-lighting",
    priority: "high",
    reference: "ready-kit",
    minutes: 15,
  },
  {
    id: "power-inventory",
    title: "List everything you rely on that needs electricity",
    description: "Inventory essential devices and plan batteries or other alternatives for each one.",
    category: "power-lighting",
    priority: "high",
    hazards: ["power-outages", "extreme-cold", "extreme-heat"],
    reference: "ready-power-outages",
    minutes: 15,
  },
  {
    id: "power-refrigeration",
    title: "Plan for refrigeration-dependent needs",
    description:
      "An unopened refrigerator keeps food cold for about four hours; a full freezer about 48 hours. Ask your pharmacist how to handle any medicines that need refrigeration.",
    category: "power-lighting",
    priority: "high",
    hazards: ["power-outages"],
    reference: "ready-power-outages",
    minutes: 15,
  },
  {
    id: "power-generator-safety",
    title: "Learn generator and backup-heat safety",
    description:
      "Use generators, camp stoves and grills only outdoors, at least 20 feet from windows and doors. Never heat your home with a gas stove or oven.",
    category: "home-safety",
    priority: "critical",
    hazards: ["power-outages", "extreme-cold", "hurricanes"],
    reference: "ready-power-outages",
    minutes: 15,
  },
  {
    id: "power-surge-protection",
    title: "Protect electronics from power surges",
    description:
      "Use surge protectors, and plan to unplug appliances during an outage — power can return with damaging spikes.",
    category: "power-lighting",
    priority: "recommended",
    detailOnly: true,
    hazards: ["power-outages", "severe-storms"],
    reference: "ready-power-outages",
    minutes: 15,
  },

  // ───────────── Evacuation ─────────────
  {
    id: "core-go-bag",
    title: "Pack a portable go-bag",
    description:
      "Keep essentials in one or two easy-to-carry containers so you can leave quickly. Never delay evacuating to finish packing.",
    category: "evacuation",
    priority: "critical",
    reference: "ready-kit",
    minutes: 60,
  },
  {
    id: "core-evac-routes",
    title: "Learn more than one evacuation route",
    description:
      "Identify several routes out of your area and where you would go — a friend's home, a hotel or a public shelter.",
    category: "evacuation",
    priority: "high",
    emphasizedFor: ["wildfires", "hurricanes", "flooding"],
    reference: "ready-evacuation",
    minutes: 20,
  },
  {
    id: "evac-orders",
    title: "Understand how evacuation orders are issued",
    description:
      "Learn how local authorities communicate evacuation orders and what each alert level means. When you are told to evacuate, leave immediately.",
    category: "evacuation",
    priority: "critical",
    hazards: ["flooding", "wildfires", "hurricanes"],
    reference: "ready-evacuation",
    minutes: 15,
  },
  {
    id: "core-practice",
    title: "Practice your plan with your household",
    description: "Walk through your evacuation routes and meeting places together at least once a year.",
    category: "evacuation",
    priority: "recommended",
    reference: "ready-plan",
    minutes: 30,
  },
  {
    id: "vehicle-kit",
    title: "Stock a car emergency kit",
    description: "Keep jumper cables, a flashlight, water, snacks, blankets and a first-aid kit in your vehicle.",
    category: "evacuation",
    priority: "high",
    requires: ["vehicle"],
    reference: "ready-winter",
    minutes: 30,
  },
  {
    id: "vehicle-fuel",
    title: "Keep your vehicle fueled during hazard seasons",
    description:
      "Gas stations may close or lose power. Keep your tank full when hazards are possible so you can leave without stopping.",
    category: "evacuation",
    priority: "high",
    requires: ["vehicle"],
    hazards: ["hurricanes", "wildfires", "flooding", "extreme-cold"],
    reference: "ready-evacuation",
    minutes: 5,
  },
  {
    id: "no-vehicle-transport",
    title: "Plan transportation if you don't have a vehicle",
    description:
      "Identify who could give you a ride, which public transit options exist, and how your community provides evacuation transportation.",
    category: "evacuation",
    priority: "critical",
    requires: ["no-vehicle"],
    reference: "ready-evacuation",
    minutes: 20,
  },
  {
    id: "evac-assistance-arrange",
    title: "Arrange evacuation assistance in advance",
    description:
      "Agree with at least two people on how they'll help you leave, how you'll reach them, and how to operate any mobility devices.",
    category: "accessibility-medical",
    priority: "critical",
    requiresAny: ["evacuation-assistance", "mobility"],
    reference: "ready-disability",
    minutes: 30,
  },
  {
    id: "evac-assistance-local",
    title: "Ask local officials about evacuation help",
    description:
      "Contact your local emergency-management agency to learn whether it offers assistance registries or accessible transportation during evacuations.",
    category: "accessibility-medical",
    priority: "high",
    requires: ["evacuation-assistance"],
    reference: "ready-evacuation",
    minutes: 20,
  },

  // ───────────── Home safety ─────────────
  {
    id: "core-alarms",
    title: "Test smoke and carbon monoxide alarms",
    description: "Install smoke and CO alarms with battery backup on every level of your home and test them monthly.",
    category: "home-safety",
    priority: "high",
    reference: "ready-power-outages",
    minutes: 15,
  },
  {
    id: "core-utilities",
    title: "Learn where your utility shutoffs are",
    description:
      "Know where your main water valve and electrical panel are, keep a wrench or pliers nearby, and follow your utility company's guidance on gas shutoff.",
    category: "home-safety",
    priority: "recommended",
    emphasizedFor: ["earthquakes"],
    reference: "ready-kit",
    minutes: 20,
  },
  {
    id: "core-fire-extinguisher",
    title: "Keep a fire extinguisher and know how to use it",
    description: "Store it somewhere easy to reach and make sure adults in the home know how it works.",
    category: "home-safety",
    priority: "recommended",
    detailOnly: true,
    reference: "ready-kit",
    minutes: 10,
  },

  // ───────────── Children & older adults ─────────────
  {
    id: "kids-school-plans",
    title: "Learn school and childcare emergency plans",
    description:
      "Ask how they communicate during emergencies, where children would be relocated, and who is authorized to pick them up.",
    category: "children-older-adults",
    priority: "high",
    requires: ["children"],
    reference: "ready-kids",
    minutes: 20,
  },
  {
    id: "kids-contacts",
    title: "Help children learn key contacts",
    description:
      "Teach children how and when to call your local emergency number, and give each child a contact card to carry.",
    category: "children-older-adults",
    priority: "high",
    requires: ["children"],
    reference: "ready-kids",
    minutes: 15,
  },
  {
    id: "kids-supplies",
    title: "Add child-specific supplies",
    description: "Include infant formula, diapers, comfort items and activities as needed for each child.",
    category: "children-older-adults",
    priority: "high",
    requires: ["children"],
    reference: "ready-kit",
    minutes: 20,
  },
  {
    id: "older-support-network",
    title: "Build a support network for older adults",
    description:
      "Identify family, friends or neighbors who will check in and help during an emergency, and share a copy of the plan with them.",
    category: "children-older-adults",
    priority: "critical",
    requires: ["older-adults"],
    reference: "ready-older-adults",
    minutes: 20,
  },
  {
    id: "older-personal-supplies",
    title: "Pack extra eyeglasses, hearing aids and batteries",
    description: "Keep spares of daily-living items that would be hard to replace quickly.",
    category: "children-older-adults",
    priority: "high",
    requires: ["older-adults"],
    reference: "ready-older-adults",
    minutes: 15,
  },
  {
    id: "medical-info-sheet",
    title: "Prepare a medical information sheet",
    description:
      "Write down medications, dosages, allergies, doctors' contact details and the model and serial numbers of medical devices. Keep it with your documents.",
    category: "children-older-adults",
    priority: "high",
    requiresAny: ["older-adults", "powered-medical", "mobility"],
    reference: "ready-disability",
    minutes: 20,
  },
  {
    id: "heat-check-ins",
    title: "Schedule check-ins during heat waves",
    description:
      "Older adults, children and people with certain health conditions face greater risk from heat. Agree on regular check-ins and a cool place to go.",
    category: "children-older-adults",
    priority: "high",
    hazards: ["extreme-heat"],
    requiresAny: ["older-adults", "children", "mobility", "powered-medical"],
    reference: "ready-heat",
    minutes: 10,
  },

  // ───────────── Accessibility & medical equipment ─────────────
  {
    id: "access-evac-options",
    title: "Identify accessible evacuation options",
    description:
      "Find out how accessible transportation and shelters work in your area, and plan a route that works with any mobility devices.",
    category: "accessibility-medical",
    priority: "critical",
    requires: ["mobility"],
    reference: "ready-disability",
    minutes: 30,
  },
  {
    id: "access-device-backup",
    title: "Plan backups for mobility devices",
    description:
      "Keep spare batteries charged, a tire patch kit or pump, and if possible a lightweight manual chair or extra cane or walker.",
    category: "accessibility-medical",
    priority: "high",
    requires: ["mobility"],
    reference: "ready-disability",
    minutes: 20,
  },
  {
    id: "comm-alternative-methods",
    title: "Include alternative communication methods",
    description:
      "Keep communication cards, pen and paper, and assistive devices with chargers in your kit. Record preferred communication methods in your plan.",
    category: "accessibility-medical",
    priority: "critical",
    requires: ["communication"],
    reference: "ready-disability",
    minutes: 20,
  },
  {
    id: "comm-accessible-alerts",
    title: "Set up alerts in accessible formats",
    description:
      "Make sure emergency alerts reach everyone, using text, vibration, visual or audio formats that work for your household.",
    category: "accessibility-medical",
    priority: "high",
    requires: ["communication"],
    reference: "ready-alerts",
    minutes: 15,
  },
  {
    id: "med-backup-power",
    title: "Plan backup power with your equipment provider",
    description:
      "Ask the equipment provider how long batteries last and which backup power options are safe for each device.",
    category: "accessibility-medical",
    priority: "critical",
    requires: ["powered-medical"],
    reference: "ready-power-outages",
    minutes: 30,
  },
  {
    id: "med-alternatives",
    title: "Identify alternatives if power is unavailable",
    description:
      "Work with your healthcare team to decide where you could go if equipment can't run at home, and how you would get there.",
    category: "accessibility-medical",
    priority: "critical",
    requires: ["powered-medical"],
    reference: "ready-disability",
    minutes: 30,
  },
  {
    id: "med-provider-contacts",
    title: "Plan how to reach healthcare providers and your utility",
    description:
      "Keep provider contact details on paper and ask your utility whether it offers priority or medical-needs programs for power restoration.",
    category: "accessibility-medical",
    priority: "high",
    requires: ["powered-medical"],
    reference: "ready-disability",
    minutes: 20,
  },

  // ───────────── Pets ─────────────
  {
    id: "pets-kit",
    title: "Build a pet emergency kit",
    description:
      "Pack food, water, medications, a leash or carrier, and sanitation supplies for each pet.",
    category: "pets",
    priority: "critical",
    requires: ["pets"],
    reference: "ready-pets",
    minutes: 30,
  },
  {
    id: "pets-identification",
    title: "Update pet identification",
    description:
      "Make sure collars, ID tags and microchip registrations are current, and keep a recent photo of each pet with your plan.",
    category: "pets",
    priority: "high",
    requires: ["pets"],
    reference: "ready-pets",
    minutes: 15,
  },
  {
    id: "pets-evacuation",
    title: "Find pet-friendly evacuation options",
    description:
      "Not every shelter or hotel accepts pets. Identify friends, family, boarding or pet-friendly lodging outside your area in advance.",
    category: "pets",
    priority: "critical",
    requires: ["pets"],
    reference: "ready-pets",
    minutes: 20,
  },
  {
    id: "pets-records",
    title: "Keep pet records with your documents",
    description: "Store vaccination and medical records and your veterinarian's contact details with your important documents.",
    category: "pets",
    priority: "recommended",
    requires: ["pets"],
    detailOnly: true,
    reference: "ready-pets",
    minutes: 10,
  },

  // ───────────── Hazard-specific ─────────────
  {
    id: "flood-risk",
    title: "Identify your local flood risk",
    description:
      "Check official flood maps (FEMA's Flood Map Service Center in the U.S.) or your local authority's flood information. Flooding doesn't follow lines on a map.",
    category: "hazard-specific",
    priority: "critical",
    hazards: ["flooding", "hurricanes"],
    reference: "ready-floods",
    minutes: 15,
  },
  {
    id: "flood-turn-around",
    title: "Agree to never enter flood water",
    description:
      "Make sure everyone knows not to walk, swim or drive through flood water. Six inches of moving water can knock a person down. Turn Around, Don't Drown.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["flooding", "hurricanes", "severe-storms"],
    reference: "ready-floods",
    minutes: 5,
  },
  {
    id: "flood-insurance",
    title: "Look into flood insurance",
    description:
      "Homeowner's policies don't cover flooding, and U.S. National Flood Insurance Program policies typically take up to 30 days to take effect.",
    category: "hazard-specific",
    priority: "recommended",
    hazards: ["flooding", "hurricanes"],
    detailOnly: true,
    reference: "ready-floods",
    minutes: 30,
  },
  {
    id: "flood-property",
    title: "Reduce water damage around your home",
    description: "Clear drains and gutters, consider check valves, and consider a sump pump with battery backup.",
    category: "hazard-specific",
    priority: "recommended",
    hazards: ["flooding"],
    detailOnly: true,
    reference: "ready-floods",
    minutes: 60,
  },
  {
    id: "wildfire-rapid-departure",
    title: "Stage essentials for a rapid departure",
    description:
      "Keep your go-bag, medications, documents, chargers and masks where you can grab them in minutes. Leave immediately when told to evacuate — don't stop to gather more.",
    category: "hazard-specific",
    priority: "critical",
    hazards: ["wildfires"],
    reference: "ready-wildfires",
    minutes: 20,
  },
  {
    id: "wildfire-clear-zone",
    title: "Create a fire-resistant zone around your home",
    description: "Keep the area at least 30 feet around your home free of leaves, debris and flammable materials.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["wildfires"],
    reference: "ready-wildfires",
    minutes: 120,
  },
  {
    id: "wildfire-clean-air-room",
    title: "Prepare a clean-air room for smoky days",
    description:
      "Choose a room you can close off from outside air, consider a portable air cleaner, and store N95 masks for each person.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["wildfires"],
    reference: "ready-wildfires",
    minutes: 30,
  },
  {
    id: "heat-cooling-locations",
    title: "Identify cooling locations",
    description:
      "Find nearby places with air conditioning, such as libraries, or contact your local health department about cooling options. Fans alone don't prevent heat illness.",
    category: "hazard-specific",
    priority: "critical",
    hazards: ["extreme-heat"],
    reference: "ready-heat",
    minutes: 15,
  },
  {
    id: "heat-illness-signs",
    title: "Learn the signs of heat illness",
    description: "Know the warning signs of heat exhaustion and heat stroke. Heat stroke is a medical emergency — call your emergency number.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["extreme-heat"],
    reference: "nws-heat",
    minutes: 10,
  },
  {
    id: "heat-local-guidance",
    title: "Review local heat-safety recommendations",
    description: "Learn how heat warnings are issued where you live and what your local health department recommends.",
    category: "hazard-specific",
    priority: "recommended",
    hazards: ["extreme-heat"],
    reference: "nws-heat",
    minutes: 10,
  },
  {
    id: "cold-winterize-home",
    title: "Prepare your home for winter weather",
    description: "Add insulation, caulking and weather stripping, and learn how to keep pipes from freezing.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["extreme-cold"],
    reference: "ready-winter",
    minutes: 60,
  },
  {
    id: "cold-warmth-supplies",
    title: "Have blankets and warm clothing for everyone",
    description: "Keep a sleeping bag or warm blanket and a change of warm clothing for each person in case heat is lost.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["extreme-cold"],
    reference: "ready-winter",
    minutes: 15,
  },
  {
    id: "cold-signs",
    title: "Learn the signs of frostbite and hypothermia",
    description: "Know the warning signs and first steps. A body temperature below 95°F (35°C) is an emergency.",
    category: "hazard-specific",
    priority: "recommended",
    hazards: ["extreme-cold"],
    detailOnly: true,
    reference: "ready-winter",
    minutes: 10,
  },
  {
    id: "cold-car-kit",
    title: "Winterize your car kit",
    description: "Add sand, warm clothes and extra blankets to your car kit, and avoid travel during winter storms when possible.",
    category: "hazard-specific",
    priority: "recommended",
    hazards: ["extreme-cold"],
    requires: ["vehicle"],
    reference: "ready-winter",
    minutes: 15,
  },
  {
    id: "quake-secure-items",
    title: "Secure heavy furniture and objects",
    description: "Anchor bookcases, water heaters and TVs, and store heavy or breakable objects on low shelves.",
    category: "hazard-specific",
    priority: "critical",
    hazards: ["earthquakes"],
    reference: "ready-earthquakes",
    minutes: 90,
  },
  {
    id: "quake-drill",
    title: "Practice Drop, Cover, and Hold On",
    description:
      "Practice with everyone in the household, including how to protect yourself if you use a cane, walker or wheelchair.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["earthquakes"],
    reference: "ready-earthquakes",
    minutes: 10,
  },
  {
    id: "quake-alerts",
    title: "Sign up for earthquake alerts where available",
    description: "Some regions offer earthquake notifications or early-warning alerts. Find out what's available where you live.",
    category: "hazard-specific",
    priority: "recommended",
    hazards: ["earthquakes"],
    detailOnly: true,
    reference: "ready-earthquakes",
    minutes: 10,
  },
  {
    id: "wind-reduce-damage",
    title: "Reduce wind and storm damage risks",
    description:
      "Trim trees that could fall on your home, plan how to secure outdoor items, and decide how you'll protect windows.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["hurricanes", "severe-storms"],
    reference: "ready-hurricanes",
    minutes: 60,
  },
  {
    id: "storm-shelter-spots",
    title: "Know where to shelter during storms",
    description:
      "Identify sturdy buildings near where you live, work and study. When thunder roars, go indoors.",
    category: "hazard-specific",
    priority: "high",
    hazards: ["severe-storms"],
    reference: "ready-thunderstorms",
    minutes: 10,
  },
];
