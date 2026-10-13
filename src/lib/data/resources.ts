/**
 * Official preparedness resources.
 *
 * Every URL in this file was opened and confirmed to resolve to the official
 * page described (or is linked directly from that agency's own index page)
 * when this content version was authored. Redirecting URLs were replaced
 * with their canonical destination. See README → "Content sources".
 */

export interface Resource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  description?: string;
}

const r = <T extends string>(id: T, title: string, publisher: string, url: string, description?: string) =>
  ({ id, title, publisher, url, description }) as const;

const LIST = [
  // General U.S. preparedness
  r("ready-home", "Ready.gov", "FEMA", "https://www.ready.gov/", "The U.S. national public-preparedness campaign."),
  r("ready-plan", "Make a Plan", "Ready.gov", "https://www.ready.gov/plan", "Household planning steps and a fillable family emergency plan."),
  r("ready-kit", "Build a Kit", "Ready.gov", "https://www.ready.gov/kit", "Basic and additional disaster supplies checklist."),
  r("ready-water", "Water", "Ready.gov", "https://www.ready.gov/water", "Emergency water needs, storage and treatment."),
  r("ready-food", "Food", "Ready.gov", "https://www.ready.gov/food", "Emergency food supplies and food safety."),
  r("ready-alerts", "Emergency Alerts", "Ready.gov", "https://www.ready.gov/alerts", "How U.S. emergency alerts and warnings work."),
  r("ready-evacuation", "Evacuation", "Ready.gov", "https://www.ready.gov/evacuation", "Planning routes, destinations and transportation."),
  r("ready-financial", "Financial Preparedness", "Ready.gov", "https://www.ready.gov/financial-preparedness", "Protecting documents, insurance and finances."),
  r("ready-be-informed", "Disasters and Emergencies", "Ready.gov", "https://www.ready.gov/be-informed", "Hazard information sheets and alert guides."),
  r("ready-kids", "Ready Kids", "Ready.gov", "https://www.ready.gov/kids", "Preparedness for children, teens and families."),
  r("ready-older-adults", "Older Adults", "Ready.gov", "https://www.ready.gov/older-adults", "Preparedness guidance for older adults and caregivers."),
  r("ready-disability", "People with Disabilities", "Ready.gov", "https://www.ready.gov/people-disabilities", "Accessibility, assistive technology and medical-equipment planning."),
  r("ready-pets", "Prepare Your Pets for Disasters", "Ready.gov", "https://www.ready.gov/pets", "Pet kits, identification and evacuation."),
  // Hazards — Ready.gov
  r("ready-floods", "Floods", "Ready.gov", "https://www.ready.gov/floods"),
  r("ready-wildfires", "Wildfires", "Ready.gov", "https://www.ready.gov/wildfires"),
  r("ready-heat", "Extreme Heat", "Ready.gov", "https://www.ready.gov/heat"),
  r("ready-winter", "Winter Weather", "Ready.gov", "https://www.ready.gov/winter-weather"),
  r("ready-power-outages", "Power Outages", "Ready.gov", "https://www.ready.gov/power-outages"),
  r("ready-earthquakes", "Earthquakes", "Ready.gov", "https://www.ready.gov/earthquakes"),
  r("ready-hurricanes", "Hurricanes", "Ready.gov", "https://www.ready.gov/hurricanes"),
  r("ready-thunderstorms", "Thunderstorms & Lightning", "Ready.gov", "https://www.ready.gov/thunderstorms-lightning"),
  // National Weather Service
  r("nws-safety", "Weather Safety for All Hazards", "National Weather Service", "https://www.weather.gov/safety/", "Safety information for weather hazards."),
  r("nws-flood", "Flood Safety", "National Weather Service", "https://www.weather.gov/safety/flood"),
  r("nws-heat", "Heat Safety", "National Weather Service", "https://www.weather.gov/safety/heat"),
  r("nws-cold", "Cold Safety", "National Weather Service", "https://www.weather.gov/safety/cold"),
  r("nws-hurricane", "Hurricane Safety", "National Weather Service", "https://www.weather.gov/safety/hurricane"),
  r("nws-thunderstorm", "Thunderstorm Safety", "National Weather Service", "https://www.weather.gov/safety/thunderstorm"),
  r("nws-wildfire", "Wildfire Weather Safety", "National Weather Service", "https://www.weather.gov/safety/wildfire"),
  // FEMA
  r("fema-home", "FEMA", "Federal Emergency Management Agency", "https://www.fema.gov/", "Disaster declarations, assistance and recovery."),
  r("fema-locations", "Search Your Location", "FEMA", "https://www.fema.gov/locations", "Find state, territory and local emergency-management resources."),
  r("fema-flood-maps", "Flood Map Service Center", "FEMA", "https://msc.fema.gov/portal", "Official U.S. flood hazard maps."),
  // Canada
  r("ca-get-prepared", "Get Prepared", "Government of Canada", "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared.html", "Canada's national emergency preparedness guidance."),
  r("ca-make-plan", "Make an Emergency Plan", "Government of Canada", "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared/make-plan.html"),
  r("ca-kits", "Making an Emergency Kit", "Government of Canada", "https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared/emergency-kits.html"),
  // United Kingdom
  r("uk-prepare", "Prepare", "UK Government", "https://prepare.campaign.gov.uk/", "UK government emergency preparedness guidance."),
  r("uk-flood-risk", "Check Long-Term Flood Risk", "GOV.UK", "https://www.gov.uk/check-long-term-flood-risk"),
  r("uk-ready-scotland", "Ready Scotland", "Scottish Government", "https://ready.scot/"),
  r("uk-ni-direct", "Be Ready for Emergencies", "nidirect (Northern Ireland)", "https://www.nidirect.gov.uk/campaigns/be-ready-emergencies"),
] as const;

export type ResourceId = (typeof LIST)[number]["id"];

export const RESOURCES: Record<ResourceId, Resource> = Object.fromEntries(
  LIST.map((item) => [item.id, item]),
) as Record<ResourceId, Resource>;

export function getResource(id: ResourceId): Resource {
  return RESOURCES[id];
}

/** Resources always shown, regardless of location. */
export const CORE_RESOURCE_IDS: ResourceId[] = ["ready-home", "nws-safety", "fema-home"];
