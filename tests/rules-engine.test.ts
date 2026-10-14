import { describe, expect, it } from "vitest";
import { getRecommendations, getTaskReason } from "@/lib/rules-engine";
import { TASKS } from "@/lib/preparedness-data";
import { profile } from "./fixtures";

const ids = (value: ReturnType<typeof getRecommendations>) =>
  value.map((task) => task.id);

describe("typed recommendation engine", () => {
  it("includes tasks for one selected hazard, not unrelated hazards", () => {
    const tasks = getRecommendations(profile({ hazards: ["flooding"] }));
    expect(ids(tasks)).toContain("flood-risk");
    expect(ids(tasks)).toContain("flood-documents");
    expect(ids(tasks)).not.toContain("wildfire-notices");
    expect(
      getTaskReason(
        tasks.find((task) => task.id === "flood-risk")!,
        profile({ hazards: ["flooding"] }),
      ),
    ).toContain("flooding");
  });
  it("includes multiple hazards without duplicate task IDs, even if catalog duplicates", () => {
    const input = profile({ hazards: ["storms", "flooding", "outages"] });
    const tasks = getRecommendations(input, [...TASKS, TASKS[0], TASKS[0]]);
    expect(ids(tasks)).toContain("storm-shelter");
    expect(ids(tasks)).toContain("outage-food");
    expect(ids(tasks)).toContain("flood-risk");
    expect(new Set(ids(tasks)).size).toBe(tasks.length);
  });
  it("keeps core tasks when no hazard is selected", () => {
    const tasks = getRecommendations(profile());
    expect(ids(tasks)).toContain("water-store");
    expect(ids(tasks)).not.toContain("flood-risk");
    expect(tasks.every((task) => task.hazardTags.length === 0)).toBe(true);
  });
  it("adds pet, accessibility, communication and powered medical tasks only when relevant", () => {
    const input = profile({
      household: {
        ...profile().household,
        pets: 2,
        accessibility: true,
        communicationSupport: true,
        poweredMedical: true,
      },
      hazards: ["outages"],
    });
    const tasks = getRecommendations(input);
    for (const id of [
      "pet-essentials",
      "pet-evacuation",
      "accessible-evacuation",
      "communication-access",
      "medical-backup-power",
      "medical-care-contacts",
      "outage-medical",
    ])
      expect(ids(tasks)).toContain(id);
    const plain = getRecommendations(profile({ hazards: ["outages"] }));
    expect(ids(plain)).not.toContain("outage-medical");
    expect(ids(plain)).not.toContain("pet-essentials");
  });
  it("responds to evacuation assistance and vehicle availability", () => {
    const input = profile({
      preferences: {
        ...profile().preferences,
        vehicle: false,
        evacuationAssistance: true,
      },
    });
    expect(ids(getRecommendations(input))).toEqual(
      expect.arrayContaining(["no-car-transport", "evac-assistance"]),
    );
    expect(ids(getRecommendations(input))).not.toContain("vehicle-ready");
  });
  it("uses only the three known official reference entry points", () => {
    expect(
      TASKS.filter((task) => task.officialUrl).every((task) =>
        [
          "https://www.ready.gov/",
          "https://www.weather.gov/safety/",
          "https://www.fema.gov/",
        ].includes(task.officialUrl!),
      ),
    ).toBe(true);
  });
});
