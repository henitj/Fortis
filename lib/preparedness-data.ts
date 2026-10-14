import type {
  Hazard,
  HouseholdTag,
  PreparednessTask,
  Priority,
  TaskCategory,
} from "./types";

export const HAZARDS: {
  id: Hazard;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "storms",
    label: "Severe storms",
    description: "High winds, lightning and severe weather",
    icon: "cloud-lightning",
  },
  {
    id: "flooding",
    label: "Flooding",
    description: "Rising water and flash floods",
    icon: "waves",
  },
  {
    id: "wildfires",
    label: "Wildfires",
    description: "Smoke and fast-changing fire conditions",
    icon: "flame",
  },
  {
    id: "heat",
    label: "Extreme heat",
    description: "Prolonged hot conditions",
    icon: "sun",
  },
  {
    id: "cold",
    label: "Extreme cold",
    description: "Freezing weather and winter storms",
    icon: "snowflake",
  },
  {
    id: "outages",
    label: "Power outages",
    description: "Interruptions to electricity",
    icon: "plug-zap",
  },
  {
    id: "earthquakes",
    label: "Earthquakes",
    description: "Shaking and aftershocks",
    icon: "activity",
  },
  {
    id: "hurricanes",
    label: "Hurricanes",
    description: "Tropical storms and coastal impacts",
    icon: "wind",
  },
];

export const TASK_CATEGORIES: {
  id: TaskCategory;
  label: string;
  short: string;
}[] = [
  { id: "water-food", label: "Water & food", short: "Water & food" },
  { id: "first-aid", label: "First aid & medications", short: "Health" },
  { id: "communication", label: "Communication", short: "Communication" },
  { id: "documents", label: "Important documents", short: "Documents" },
  { id: "power-lighting", label: "Power & lighting", short: "Power" },
  { id: "evacuation", label: "Evacuation", short: "Evacuation" },
  { id: "home-safety", label: "Home safety", short: "Home safety" },
  {
    id: "children-older",
    label: "Children & older adults",
    short: "Family needs",
  },
  {
    id: "accessibility",
    label: "Accessibility & medical equipment",
    short: "Accessibility",
  },
  { id: "pets", label: "Pets", short: "Pets" },
  { id: "hazards", label: "Hazard-specific preparation", short: "Hazards" },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  essential: "Essential",
  important: "Important",
  recommended: "Next step",
};
export const PRIORITY_ORDER: Record<Priority, number> = {
  essential: 0,
  important: 1,
  recommended: 2,
};

export const HOUSEHOLD_TAG_LABELS: Record<HouseholdTag, string> = {
  children: "children in your household",
  "older-adults": "older adults in your household",
  pets: "pets in your household",
  accessibility: "accessibility needs",
  "powered-medical": "powered medical equipment",
  "communication-support": "communication support needs",
  vehicle: "vehicle access",
  "no-vehicle": "no vehicle available",
  "evacuation-assistance": "possible evacuation assistance needs",
};

const READY = "https://www.ready.gov/";
const WEATHER = "https://www.weather.gov/safety/";
const FEMA = "https://www.fema.gov/";

// Empty tag arrays mean the task applies to every household. Within each tag group,
// any match is enough; when both groups are nonempty, both groups must match.
export const TASKS: PreparednessTask[] = [
  {
    id: "water-store",
    title: "Set aside household water",
    description:
      "Use your water target below as a starting point. Store it safely and check containers periodically.",
    category: "water-food",
    priority: "essential",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "food-plan",
    title: "Plan shelf-stable meals",
    description:
      "Use your person-days and meal target to choose food your household can eat and prepare without normal utilities.",
    category: "water-food",
    priority: "essential",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 25,
  },
  {
    id: "food-openers",
    title: "Keep a manual can opener and eating supplies",
    description:
      "Include the utensils and preparation supplies needed for the food you chose.",
    category: "water-food",
    priority: "recommended",
    hazardTags: [],
    householdTags: [],
    estimatedMinutes: 10,
  },
  {
    id: "first-aid-kit",
    title: "Put together a first-aid kit",
    description:
      "Keep basic first-aid supplies in an easy-to-find place and review them periodically.",
    category: "first-aid",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "medication-continuity",
    title: "Plan for medication continuity",
    description:
      "Ask a pharmacist or healthcare professional about an appropriate emergency supply and safe storage. Do not change treatment without clinical advice.",
    category: "first-aid",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "contact-plan",
    title: "Write down a household contact plan",
    description:
      "Record key contacts, an out-of-area contact and how everyone will reconnect if separated.",
    category: "communication",
    priority: "essential",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "alert-sources",
    title: "Know where official updates come from",
    description:
      "Identify your local emergency-management agency and trusted local alert channels. This app does not show live alerts.",
    category: "communication",
    priority: "essential",
    hazardTags: [],
    householdTags: [],
    officialUrl: FEMA,
    estimatedMinutes: 10,
  },
  {
    id: "practice-contact",
    title: "Review the plan together",
    description:
      "Make sure each household member knows the meeting places and how to reach your out-of-area contact.",
    category: "communication",
    priority: "recommended",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "document-copies",
    title: "Protect essential document copies",
    description:
      "Store copies of important documents securely and in a way you can access when needed. Avoid leaving sensitive information exposed.",
    category: "documents",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 25,
  },
  {
    id: "lighting",
    title: "Keep working flashlights and spare power",
    description:
      "Place flashlights where you can find them, and check batteries or charging options.",
    category: "power-lighting",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "charge-devices",
    title: "Set up backup phone charging",
    description:
      "Keep a compatible backup charger ready and consider how you will use it safely during an outage.",
    category: "power-lighting",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    estimatedMinutes: 10,
  },
  {
    id: "evacuation-routes",
    title: "Identify two ways out",
    description:
      "Discuss safe ways to leave your home and area, and follow current official evacuation instructions if issued.",
    category: "evacuation",
    priority: "essential",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "meeting-places",
    title: "Choose two meeting places",
    description:
      "Pick a nearby and an alternate meeting place; write both in the communication plan below.",
    category: "evacuation",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 10,
  },
  {
    id: "go-bag",
    title: "Keep departure essentials easy to reach",
    description:
      "Identify the items you would need to leave promptly. Never delay an official evacuation to collect supplies.",
    category: "evacuation",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 25,
  },
  {
    id: "home-shutoffs",
    title: "Learn relevant home utility shutoffs",
    description:
      "Know where utility controls are and follow utility-provider guidance; only shut off a service when instructed or safe to do so.",
    category: "home-safety",
    priority: "recommended",
    hazardTags: [],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "alarms",
    title: "Check smoke and carbon monoxide alarms",
    description:
      "Test installed alarms according to manufacturer instructions and replace batteries or units as needed.",
    category: "home-safety",
    priority: "important",
    hazardTags: [],
    householdTags: [],
    estimatedMinutes: 10,
  },

  {
    id: "child-needs",
    title: "Include child-specific essentials",
    description:
      "Plan for age-appropriate food, comfort items, school or caregiver contacts, and any supplies your children need.",
    category: "children-older",
    priority: "important",
    hazardTags: [],
    householdTags: ["children"],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "older-support",
    title: "Check support arrangements for older adults",
    description:
      "Discuss transportation, daily needs and who will check in. Older adults are already included in your adult headcount.",
    category: "children-older",
    priority: "important",
    hazardTags: [],
    householdTags: ["older-adults"],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "accessible-evacuation",
    title: "Identify accessible ways to evacuate",
    description:
      "Consider routes, transport and assistance that fit your access needs; coordinate ahead of time where possible.",
    category: "accessibility",
    priority: "essential",
    hazardTags: [],
    householdTags: ["accessibility"],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "accessible-supplies",
    title: "Prepare essential access supplies",
    description:
      "Include supplies or equipment you rely on in your plan, without recording private medical details here.",
    category: "accessibility",
    priority: "important",
    hazardTags: [],
    householdTags: ["accessibility"],
    estimatedMinutes: 20,
  },
  {
    id: "communication-access",
    title: "Choose accessible ways to stay in touch",
    description:
      "Plan a communication method that works for everyone and share it with trusted contacts.",
    category: "accessibility",
    priority: "important",
    hazardTags: [],
    householdTags: ["communication-support"],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "medical-backup-power",
    title: "Arrange a medical equipment backup-power plan",
    description:
      "Consult your equipment provider and healthcare team about safe backup power, duration and continuity. Do not assume a household power bank is sufficient.",
    category: "accessibility",
    priority: "essential",
    hazardTags: [],
    householdTags: ["powered-medical"],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "medical-care-contacts",
    title: "Plan how to reach your care team",
    description:
      "Identify whom to contact and what alternatives to use if powered equipment cannot operate. Follow professional guidance.",
    category: "accessibility",
    priority: "essential",
    hazardTags: [],
    householdTags: ["powered-medical"],
    estimatedMinutes: 15,
  },
  {
    id: "pet-essentials",
    title: "Prepare your pets' essentials",
    description:
      "Plan species-appropriate food, water, identification, medications if applicable, and safe carriers or restraints.",
    category: "pets",
    priority: "important",
    hazardTags: [],
    householdTags: ["pets"],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "pet-evacuation",
    title: "Plan how pets will leave with you",
    description:
      "Find out how to accommodate your pets during evacuation. Never wait for supplies if authorities direct you to leave.",
    category: "pets",
    priority: "important",
    hazardTags: [],
    householdTags: ["pets"],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "no-car-transport",
    title: "Plan an evacuation option without a vehicle",
    description:
      "Identify reliable transport and local assistance options in advance; follow official directions during an emergency.",
    category: "evacuation",
    priority: "essential",
    hazardTags: [],
    householdTags: ["no-vehicle"],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "vehicle-ready",
    title: "Check your vehicle departure plan",
    description:
      "Know where keys and essentials are, and consider fuel or charging availability when planning routes.",
    category: "evacuation",
    priority: "recommended",
    hazardTags: [],
    householdTags: ["vehicle"],
    estimatedMinutes: 10,
  },
  {
    id: "evac-assistance",
    title: "Arrange possible evacuation assistance",
    description:
      "Talk with trusted people and local services about assistance before it is needed; keep alternatives in mind.",
    category: "evacuation",
    priority: "essential",
    hazardTags: [],
    householdTags: ["evacuation-assistance"],
    officialUrl: READY,
    estimatedMinutes: 20,
  },

  {
    id: "storm-shelter",
    title: "Identify a safer place for severe storms",
    description:
      "Review official storm safety guidance and choose a suitable place in your home or nearby.",
    category: "hazards",
    priority: "important",
    hazardTags: ["storms"],
    householdTags: [],
    officialUrl: WEATHER,
    estimatedMinutes: 10,
  },
  {
    id: "storm-outdoor",
    title: "Plan for outdoor items and weather updates",
    description:
      "Know how to secure loose items safely in advance and where you will check official storm information.",
    category: "hazards",
    priority: "recommended",
    hazardTags: ["storms"],
    householdTags: [],
    officialUrl: WEATHER,
    estimatedMinutes: 15,
  },
  {
    id: "flood-risk",
    title: "Look up local flood and evacuation information",
    description:
      "Find your local flood-risk information and learn how authorities communicate evacuation instructions. FORTIS does not assess your property.",
    category: "hazards",
    priority: "essential",
    hazardTags: ["flooding"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "flood-documents",
    title: "Protect documents from water damage",
    description:
      "Consider water-resistant storage for important copies, while keeping them accessible for departure.",
    category: "documents",
    priority: "important",
    hazardTags: ["flooding"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "wildfire-notices",
    title: "Learn local wildfire evacuation notices",
    description:
      "Know where local authorities post notifications and which routes may be available. Follow orders immediately.",
    category: "hazards",
    priority: "essential",
    hazardTags: ["wildfires"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "wildfire-ready",
    title: "Prepare for a prompt departure",
    description:
      "Keep essential items organized and identify more than one route. Do not delay leaving to finish a checklist.",
    category: "evacuation",
    priority: "essential",
    hazardTags: ["wildfires"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "heat-cooling",
    title: "Identify accessible cooling options",
    description:
      "Find suitable cooled places you can use and check local heat-safety recommendations; do not assume a site is open.",
    category: "hazards",
    priority: "essential",
    hazardTags: ["heat"],
    householdTags: [],
    officialUrl: WEATHER,
    estimatedMinutes: 15,
  },
  {
    id: "heat-water",
    title: "Review extra water needs during heat",
    description:
      "Your baseline water quantity may need to increase with heat, activity, illness or other circumstances.",
    category: "water-food",
    priority: "important",
    hazardTags: ["heat"],
    householdTags: [],
    officialUrl: WEATHER,
    estimatedMinutes: 10,
  },
  {
    id: "cold-warmth",
    title: "Plan safe ways to stay warm",
    description:
      "Set aside appropriate layers and identify a safe heated location. Follow official heating and carbon monoxide safety guidance.",
    category: "hazards",
    priority: "essential",
    hazardTags: ["cold"],
    householdTags: [],
    officialUrl: WEATHER,
    estimatedMinutes: 15,
  },
  {
    id: "outage-food",
    title: "Plan for a power interruption",
    description:
      "Review safe food storage and how you will charge devices and get official updates without mains power.",
    category: "hazards",
    priority: "important",
    hazardTags: ["outages"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "outage-medical",
    title: "Review equipment continuity during outages",
    description:
      "Confirm backup arrangements with your equipment provider and healthcare team before power is interrupted.",
    category: "accessibility",
    priority: "essential",
    hazardTags: ["outages"],
    householdTags: ["powered-medical"],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "quake-safe",
    title: "Learn earthquake protective actions",
    description:
      "Review official guidance for what to do during shaking and aftershocks, and discuss it with your household.",
    category: "hazards",
    priority: "essential",
    hazardTags: ["earthquakes"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
  {
    id: "quake-secure",
    title: "Check for fall hazards at home",
    description:
      "Consider securing heavy items and keeping exit paths clear where practical.",
    category: "home-safety",
    priority: "important",
    hazardTags: ["earthquakes"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 20,
  },
  {
    id: "hurricane-guidance",
    title: "Understand local hurricane instructions",
    description:
      "Find how local officials communicate watches, warnings and evacuation orders; do not infer them from this plan.",
    category: "hazards",
    priority: "essential",
    hazardTags: ["hurricanes"],
    householdTags: [],
    officialUrl: WEATHER,
    estimatedMinutes: 15,
  },
  {
    id: "hurricane-route",
    title: "Review evacuation routes before a storm",
    description:
      "Identify possible routes and where to get current instructions. Leave when directed, without delaying for supplies.",
    category: "evacuation",
    priority: "essential",
    hazardTags: ["hurricanes"],
    householdTags: [],
    officialUrl: READY,
    estimatedMinutes: 15,
  },
];
