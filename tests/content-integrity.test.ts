import { describe, expect, it } from "vitest";
import { TASKS } from "@/lib/data/tasks";
import { RESOURCES } from "@/lib/data/resources";
import { HAZARDS } from "@/lib/data/hazards";
import { TASK_CATEGORIES } from "@/lib/data/categories";
import { US_REGIONS } from "@/lib/data/locations";
import { HAZARD_IDS } from "@/lib/schema";

const OFFICIAL_HOSTS = [
  "www.ready.gov",
  "www.weather.gov",
  "www.fema.gov",
  "msc.fema.gov",
  "www.canada.ca",
  "prepare.campaign.gov.uk",
  "www.gov.uk",
  "ready.scot",
  "www.nidirect.gov.uk",
];

describe("content integrity", () => {
  it("task IDs are unique and kebab-case", () => {
    const ids = TASKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("every task references a known resource and category", () => {
    const cats = new Set(TASK_CATEGORIES.map((c) => c.id));
    for (const t of TASKS) {
      expect(cats.has(t.category), t.id).toBe(true);
      if (t.reference) expect(RESOURCES[t.reference], t.id).toBeDefined();
      for (const h of [...(t.hazards ?? []), ...(t.emphasizedFor ?? [])]) expect(HAZARD_IDS).toContain(h);
    }
  });

  it("every category has at least one task", () => {
    for (const c of TASK_CATEGORIES) expect(TASKS.some((t) => t.category === c.id), c.id).toBe(true);
  });

  it("every hazard has official resources", () => {
    for (const h of HAZARDS) {
      expect(h.resources.length).toBeGreaterThan(0);
      for (const r of h.resources) expect(RESOURCES[r]).toBeDefined();
    }
  });

  it("all resource URLs are HTTPS links to official hosts", () => {
    const urls = [...Object.values(RESOURCES).map((r) => r.url), ...US_REGIONS.map((r) => r.officialUrl!)];
    for (const url of urls) {
      const u = new URL(url);
      expect(u.protocol, url).toBe("https:");
      expect(OFFICIAL_HOSTS, url).toContain(u.host);
    }
  });

  it("covers all 50 states, DC and territories exactly once", () => {
    const codes = US_REGIONS.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.length).toBe(56);
    expect(US_REGIONS.find((r) => r.code === "DC")!.officialUrl).toBe("https://www.fema.gov/locations/district-of-columbia-(dc)");
  });
});
