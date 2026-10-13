import type { CountryCode } from "@/lib/schema";
import { getResource, type Resource, type ResourceId } from "@/lib/data/resources";

export interface CountryOption {
  code: CountryCode;
  label: string;
  regionLabel?: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "US", label: "United States", regionLabel: "State or territory" },
  { code: "CA", label: "Canada", regionLabel: "Province or territory" },
  { code: "GB", label: "United Kingdom", regionLabel: "Nation" },
  { code: "OTHER", label: "Another country" },
  { code: "UNSPECIFIED", label: "Prefer not to say" },
];

export interface RegionOption {
  code: string;
  name: string;
  /** Verified official page specific to this jurisdiction, if one exists. */
  officialUrl?: string;
  officialTitle?: string;
  /** FEMA region number for U.S. states and territories. */
  femaRegion?: number;
}

/**
 * U.S. states and territories with their FEMA location page.
 * URLs and regions are taken verbatim from FEMA's official
 * "Regions, States and Territories" index (https://www.fema.gov/about/regions).
 * Note FEMA's slug for D.C. is `district-of-columbia-(dc)`.
 */
const US_RAW: Array<[code: string, name: string, slug: string, region: number]> = [
  ["AL", "Alabama", "alabama", 4],
  ["AK", "Alaska", "alaska", 10],
  ["AS", "American Samoa", "american-samoa", 9],
  ["AZ", "Arizona", "arizona", 9],
  ["AR", "Arkansas", "arkansas", 6],
  ["CA", "California", "california", 9],
  ["CO", "Colorado", "colorado", 8],
  ["CT", "Connecticut", "connecticut", 1],
  ["DE", "Delaware", "delaware", 3],
  ["DC", "District of Columbia", "district-of-columbia-(dc)", 3],
  ["FL", "Florida", "florida", 4],
  ["GA", "Georgia", "georgia", 4],
  ["GU", "Guam", "guam", 9],
  ["HI", "Hawaii", "hawaii", 9],
  ["ID", "Idaho", "idaho", 10],
  ["IL", "Illinois", "illinois", 5],
  ["IN", "Indiana", "indiana", 5],
  ["IA", "Iowa", "iowa", 7],
  ["KS", "Kansas", "kansas", 7],
  ["KY", "Kentucky", "kentucky", 4],
  ["LA", "Louisiana", "louisiana", 6],
  ["ME", "Maine", "maine", 1],
  ["MD", "Maryland", "maryland", 3],
  ["MA", "Massachusetts", "massachusetts", 1],
  ["MI", "Michigan", "michigan", 5],
  ["MN", "Minnesota", "minnesota", 5],
  ["MS", "Mississippi", "mississippi", 4],
  ["MO", "Missouri", "missouri", 7],
  ["MT", "Montana", "montana", 8],
  ["NE", "Nebraska", "nebraska", 7],
  ["NV", "Nevada", "nevada", 9],
  ["NH", "New Hampshire", "new-hampshire", 1],
  ["NJ", "New Jersey", "new-jersey", 2],
  ["NM", "New Mexico", "new-mexico", 6],
  ["NY", "New York", "new-york", 2],
  ["NC", "North Carolina", "north-carolina", 4],
  ["ND", "North Dakota", "north-dakota", 8],
  ["MP", "Northern Mariana Islands", "commonwealth-of-the-northern-mariana-islands", 9],
  ["OH", "Ohio", "ohio", 5],
  ["OK", "Oklahoma", "oklahoma", 6],
  ["OR", "Oregon", "oregon", 10],
  ["PA", "Pennsylvania", "pennsylvania", 3],
  ["PR", "Puerto Rico", "puerto-rico", 2],
  ["RI", "Rhode Island", "rhode-island", 1],
  ["SC", "South Carolina", "south-carolina", 4],
  ["SD", "South Dakota", "south-dakota", 8],
  ["TN", "Tennessee", "tennessee", 4],
  ["TX", "Texas", "texas", 6],
  ["UT", "Utah", "utah", 8],
  ["VT", "Vermont", "vermont", 1],
  ["VI", "U.S. Virgin Islands", "virgin-islands", 2],
  ["VA", "Virginia", "virginia", 3],
  ["WA", "Washington", "washington", 10],
  ["WV", "West Virginia", "west-virginia", 3],
  ["WI", "Wisconsin", "wisconsin", 5],
  ["WY", "Wyoming", "wyoming", 8],
];

export const US_REGIONS: RegionOption[] = US_RAW.map(([code, name, slug, femaRegion]) => ({
  code,
  name,
  femaRegion,
  officialUrl: `https://www.fema.gov/locations/${slug}`,
  officialTitle: `FEMA: ${name}`,
}));

/** Canadian provinces — no per-province links are shown (not individually verified). */
export const CA_REGIONS: RegionOption[] = [
  ["AB", "Alberta"],
  ["BC", "British Columbia"],
  ["MB", "Manitoba"],
  ["NB", "New Brunswick"],
  ["NL", "Newfoundland and Labrador"],
  ["NS", "Nova Scotia"],
  ["NT", "Northwest Territories"],
  ["NU", "Nunavut"],
  ["ON", "Ontario"],
  ["PE", "Prince Edward Island"],
  ["QC", "Quebec"],
  ["SK", "Saskatchewan"],
  ["YT", "Yukon"],
].map(([code, name]) => ({ code: code!, name: name! }));

/** UK nations. Scotland and Northern Ireland links are those listed on the official UK Prepare site. */
export const GB_REGIONS: RegionOption[] = [
  { code: "ENG", name: "England" },
  { code: "SCT", name: "Scotland", officialUrl: "https://ready.scot/", officialTitle: "Ready Scotland" },
  { code: "WLS", name: "Wales" },
  {
    code: "NIR",
    name: "Northern Ireland",
    officialUrl: "https://www.nidirect.gov.uk/campaigns/be-ready-emergencies",
    officialTitle: "nidirect: Be Ready for Emergencies",
  },
];

export function getRegions(country: CountryCode): RegionOption[] {
  switch (country) {
    case "US":
      return US_REGIONS;
    case "CA":
      return CA_REGIONS;
    case "GB":
      return GB_REGIONS;
    default:
      return [];
  }
}

export function getCountry(code: CountryCode): CountryOption {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1]!;
}

export function getRegion(country: CountryCode, regionCode: string): RegionOption | undefined {
  if (!regionCode) return undefined;
  return getRegions(country).find((r) => r.code === regionCode);
}

export function describeLocation(country: CountryCode, regionCode: string, locality: string): string {
  if (country === "UNSPECIFIED") return "Location not specified";
  const parts: string[] = [];
  if (locality.trim()) parts.push(locality.trim());
  const region = getRegion(country, regionCode);
  if (region) parts.push(region.name);
  parts.push(getCountry(country).label);
  return parts.join(", ");
}

export interface LocationGuidance {
  /** Resources tailored to the jurisdiction (only verified mappings). */
  resources: Resource[];
  /** Plain-language note about local emergency management. */
  note: string;
  /** True when a jurisdiction-specific official link is included. */
  isJurisdictionSpecific: boolean;
}

const res = (ids: ResourceId[]) => ids.map(getResource);

export function getLocationGuidance(country: CountryCode, regionCode: string): LocationGuidance {
  const region = getRegion(country, regionCode);
  const regional: Resource[] = region?.officialUrl
    ? [
        {
          id: `region-${country}-${region.code}`,
          title: region.officialTitle ?? region.name,
          publisher: country === "US" ? `FEMA${region.femaRegion ? ` · Region ${region.femaRegion}` : ""}` : "Official government site",
          url: region.officialUrl,
          description:
            country === "US"
              ? `Disaster declarations, emergency-response contacts and resources for ${region.name}.`
              : `Official preparedness guidance for ${region.name}.`,
        },
      ]
    : [];

  switch (country) {
    case "US":
      return {
        resources: [...regional, ...res(["ready-home", "fema-locations", "ready-alerts"])],
        isJurisdictionSpecific: regional.length > 0,
        note: region
          ? `FEMA's ${region.name} page lists your state or territory emergency-management agency. Your city or county emergency-management office is the best source for local alerts, evacuation zones and shelters.`
          : "Select your state to see its FEMA page, or use FEMA's location search to find your state and local emergency-management offices.",
      };
    case "CA":
      return {
        resources: res(["ca-get-prepared", "ca-make-plan", "ca-kits"]),
        isJurisdictionSpecific: false,
        note: "Your province or territory and your municipality manage local alerts and evacuations. Identify your local emergency-management organization and how it issues alerts.",
      };
    case "GB":
      return {
        resources: [...regional, ...res(["uk-prepare", "uk-flood-risk"])],
        isJurisdictionSpecific: regional.length > 0,
        note: "Your local council and local resilience forum publish local emergency information. Check which alerts and warnings apply where you live.",
      };
    default:
      return {
        resources: [],
        isJurisdictionSpecific: false,
        note: "FORTIS doesn't have verified official links for your location. Identify your national and local emergency-management agencies and how they issue alerts — their instructions always take priority over general guidance.",
      };
  }
}
