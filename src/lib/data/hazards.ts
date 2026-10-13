import type { HazardId } from "@/lib/schema";
import type { ResourceId } from "@/lib/data/resources";

export interface HazardDefinition {
  id: HazardId;
  label: string;
  /** Neutral description — never implies the hazard is imminent or predicted. */
  description: string;
  resources: ResourceId[];
}

export const HAZARDS: HazardDefinition[] = [
  {
    id: "severe-storms",
    label: "Severe storms",
    description: "Thunderstorms, lightning, hail and damaging winds.",
    resources: ["ready-thunderstorms", "nws-thunderstorm"],
  },
  {
    id: "flooding",
    label: "Flooding",
    description: "Rising water from rain, rivers, coastal surge or flash floods.",
    resources: ["ready-floods", "nws-flood", "fema-flood-maps"],
  },
  {
    id: "wildfires",
    label: "Wildfires",
    description: "Fast-moving fires, smoke and short-notice evacuations.",
    resources: ["ready-wildfires", "nws-wildfire"],
  },
  {
    id: "extreme-heat",
    label: "Extreme heat",
    description: "Prolonged high temperatures and humidity.",
    resources: ["ready-heat", "nws-heat"],
  },
  {
    id: "extreme-cold",
    label: "Extreme cold",
    description: "Winter storms, ice and dangerously low temperatures.",
    resources: ["ready-winter", "nws-cold"],
  },
  {
    id: "power-outages",
    label: "Power outages",
    description: "Extended loss of electricity at home.",
    resources: ["ready-power-outages"],
  },
  {
    id: "earthquakes",
    label: "Earthquakes",
    description: "Sudden ground shaking and aftershocks.",
    resources: ["ready-earthquakes"],
  },
  {
    id: "hurricanes",
    label: "Hurricanes",
    description: "Tropical storms with high winds, heavy rain and storm surge.",
    resources: ["ready-hurricanes", "nws-hurricane"],
  },
];

const BY_ID = new Map(HAZARDS.map((h) => [h.id, h]));

export function getHazard(id: HazardId): HazardDefinition {
  const hazard = BY_ID.get(id);
  if (!hazard) throw new Error(`Unknown hazard: ${id}`);
  return hazard;
}

/** Stable, display-ordered list of the given hazard IDs. */
export function sortHazards(ids: readonly HazardId[]): HazardId[] {
  const set = new Set(ids);
  return HAZARDS.filter((h) => set.has(h.id)).map((h) => h.id);
}
