// Only these verified, general U.S. government entry points are used. FORTIS does not infer local alerts.
export const OFFICIAL_RESOURCES = [
  {
    name: "Ready.gov",
    url: "https://www.ready.gov/",
    description: "General emergency planning guidance",
  },
  {
    name: "National Weather Service safety",
    url: "https://www.weather.gov/safety/",
    description: "Weather hazard safety guidance",
  },
  {
    name: "FEMA",
    url: "https://www.fema.gov/",
    description: "Federal preparedness and recovery information",
  },
] as const;

export const DISCLAIMER =
  "FORTIS provides general emergency-preparedness planning tools. It does not provide live emergency alerts, predict disasters, or replace instructions from local authorities. During an emergency, follow current official guidance and contact emergency services when needed.";

export function locationResourceNote(country: string): string {
  return country === "US"
    ? "For instructions specific to your area, identify your local emergency-management agency. FORTIS does not look up local alerts."
    : "These linked resources are U.S. government guidance. Identify your local emergency-management agency for instructions specific to your area.";
}
