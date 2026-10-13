import { describe, expect, it } from "vitest";
import { generateTasks, diffTaskIds, evaluateTask } from "@/lib/engine/tasks";
import { deriveContext } from "@/lib/engine/context";
import { TASKS, type TaskDefinition } from "@/lib/data/tasks";
import { HAZARD_IDS } from "@/lib/schema";
import { makeProfile } from "./helpers";

const ids = (profile = makeProfile()) => generateTasks(profile).map((t) => t.id);

describe("rules engine", () => {
  it("is deterministic", () => {
    const p = makeProfile({ hazards: ["flooding", "wildfires"], household: { pets: 2, children: 1 } });
    expect(ids(p)).toEqual(ids(p));
  });

  it("never produces duplicate task IDs, even if the library contains duplicates", () => {
    const all = makeProfile({
      hazards: [...HAZARD_IDS],
      household: { children: 2, olderAdults: 1, pets: 1, mobilityNeeds: "yes", poweredMedical: "yes", communicationNeeds: "yes" },
      preferences: { detailLevel: "detailed", evacuationAssistance: "yes" },
    });
    const out = ids(all);
    expect(new Set(out).size).toBe(out.length);

    const dupLibrary: TaskDefinition[] = [...TASKS, TASKS[0]!];
    const out2 = generateTasks(all, dupLibrary).map((t) => t.id);
    expect(new Set(out2).size).toBe(out2.length);
  });

  it("includes only universal tasks for a basic household with no hazards", () => {
    const out = generateTasks(makeProfile({ household: { adults: 1 } }));
    for (const t of out) {
      expect(t.hazards).toBeUndefined();
      expect(t.detailOnly).toBeFalsy();
    }
    expect(out.map((t) => t.id)).toContain("core-water-supply");
    expect(out.map((t) => t.id)).not.toContain("core-meeting-places"); // single-person household
  });

  it("adds flood tasks only when flooding is selected", () => {
    expect(ids()).not.toContain("flood-risk");
    const flood = ids(makeProfile({ hazards: ["flooding"] }));
    expect(flood).toEqual(expect.arrayContaining(["flood-risk", "evac-orders", "flood-protect-documents"]));
  });

  it("adds wildfire, heat and power-outage tasks for those hazards", () => {
    expect(ids(makeProfile({ hazards: ["wildfires"] }))).toEqual(
      expect.arrayContaining(["evac-orders", "wildfire-rapid-departure", "wildfire-clean-air-room"]),
    );
    expect(ids(makeProfile({ hazards: ["extreme-heat"] }))).toEqual(
      expect.arrayContaining(["heat-cooling-locations", "heat-extra-water", "heat-local-guidance"]),
    );
    expect(ids(makeProfile({ hazards: ["power-outages"] }))).toEqual(
      expect.arrayContaining(["power-refrigeration", "power-generator-safety", "power-inventory"]),
    );
  });

  it("shares a task across hazards instead of duplicating it", () => {
    const tasks = generateTasks(makeProfile({ hazards: ["flooding", "wildfires", "hurricanes"] }));
    const evac = tasks.filter((t) => t.id === "evac-orders");
    expect(evac).toHaveLength(1);
    expect(evac[0]!.matchedHazards).toEqual(["flooding", "wildfires", "hurricanes"]);
    expect(evac[0]!.reason).toMatch(/flooding, wildfires, and hurricanes/);
  });

  it("adds household-specific tasks from household facts", () => {
    const base = ids();
    expect(base).not.toContain("pets-kit");
    expect(base).not.toContain("med-backup-power");
    const p = makeProfile({
      household: { pets: 1, children: 1, olderAdults: 1, mobilityNeeds: "yes", poweredMedical: "yes", communicationNeeds: "yes" },
    });
    expect(ids(p)).toEqual(
      expect.arrayContaining([
        "pets-kit",
        "pets-evacuation",
        "kids-school-plans",
        "older-support-network",
        "access-evac-options",
        "med-backup-power",
        "med-alternatives",
        "comm-alternative-methods",
      ]),
    );
  });

  it("treats 'prefer not to say' answers as not selected", () => {
    const p = makeProfile({ household: { mobilityNeeds: "unspecified", poweredMedical: "unspecified" } });
    expect(ids(p)).not.toContain("med-backup-power");
    expect(ids(p)).not.toContain("access-evac-options");
  });

  it("swaps vehicle and no-vehicle tasks", () => {
    expect(ids(makeProfile({ preferences: { hasVehicle: "yes" } }))).toContain("vehicle-kit");
    const noCar = ids(makeProfile({ preferences: { hasVehicle: "no" } }));
    expect(noCar).toContain("no-vehicle-transport");
    expect(noCar).not.toContain("vehicle-kit");
  });

  it("includes evacuation-assistance tasks for 'yes' and 'unsure'", () => {
    expect(ids(makeProfile({ preferences: { evacuationAssistance: "no" } }))).not.toContain("evac-assistance-arrange");
    expect(ids(makeProfile({ preferences: { evacuationAssistance: "yes" } }))).toContain("evac-assistance-arrange");
    expect(ids(makeProfile({ preferences: { evacuationAssistance: "unsure" } }))).toContain("evac-assistance-local");
  });

  it("concise plans omit detail-only tasks; detailed plans include them", () => {
    const p = { hazards: ["flooding"] as const };
    const concise = ids(makeProfile({ hazards: [...p.hazards], preferences: { detailLevel: "concise" } }));
    const detailed = ids(makeProfile({ hazards: [...p.hazards], preferences: { detailLevel: "detailed" } }));
    expect(concise).not.toContain("flood-insurance");
    expect(detailed).toContain("flood-insurance");
    expect(detailed.length).toBeGreaterThan(concise.length);
  });

  it("raises emphasized universal tasks one level and explains why", () => {
    const base = generateTasks(makeProfile()).find((t) => t.id === "core-evac-routes")!;
    expect(base.effectivePriority).toBe("high");
    const fire = generateTasks(makeProfile({ hazards: ["wildfires"] })).find((t) => t.id === "core-evac-routes")!;
    expect(fire.effectivePriority).toBe("critical");
    expect(fire.reason).toMatch(/wildfires/);
  });

  it("never jumps a recommended task straight to critical", () => {
    const base = generateTasks(makeProfile()).find((t) => t.id === "core-insurance-review")!;
    expect(base.effectivePriority).toBe("recommended");
    const flood = generateTasks(makeProfile({ hazards: ["flooding"] })).find((t) => t.id === "core-insurance-review")!;
    expect(flood.effectivePriority).toBe("high");
  });

  it("puts tasks for specific household needs first within a priority level", () => {
    const tasks = generateTasks(makeProfile({ hazards: ["power-outages"], household: { poweredMedical: "yes" } }));
    expect(tasks[0]!.id).toBe("med-backup-power");
    const critical = tasks.filter((t) => t.effectivePriority === "critical");
    const firstGeneric = critical.findIndex((t) => t.relevance === 0);
    expect(critical.slice(firstGeneric).every((t) => t.relevance === 0)).toBe(true);
  });

  it("sorts by priority, then relevance", () => {
    const tasks = generateTasks(makeProfile({ hazards: ["flooding"], household: { pets: 1 } }));
    const rank = { critical: 0, high: 1, recommended: 2 } as const;
    for (let i = 1; i < tasks.length; i++) {
      expect(rank[tasks[i - 1]!.effectivePriority]).toBeLessThanOrEqual(rank[tasks[i]!.effectivePriority]);
    }
  });

  it("every selectable hazard contributes at least three tasks", () => {
    const universal = new Set(ids());
    for (const h of HAZARD_IDS) {
      const added = ids(makeProfile({ hazards: [h] })).filter((id) => !universal.has(id));
      const emphasized = generateTasks(makeProfile({ hazards: [h] })).filter((t) => t.matchedHazards.includes(h));
      expect(new Set([...added, ...emphasized.map((t) => t.id)]).size, h).toBeGreaterThanOrEqual(3);
    }
  });

  it("requires every 'requires' tag", () => {
    const task: TaskDefinition = { id: "x", title: "x", description: "x", category: "pets", priority: "high", requires: ["pets", "vehicle"] };
    const petsNoCar = deriveContext(makeProfile({ household: { pets: 1 }, preferences: { hasVehicle: "no" } }));
    expect(evaluateTask(task, petsNoCar).included).toBe(false);
    const petsCar = deriveContext(makeProfile({ household: { pets: 1 }, preferences: { hasVehicle: "yes" } }));
    expect(evaluateTask(task, petsCar).included).toBe(true);
  });

  it("no task tells users to delay evacuation", () => {
    for (const t of TASKS) {
      const text = `${t.title} ${t.description}`;
      // "Never delay evacuating" is fine; any un-negated instruction to delay is not.
      expect(text, t.id).not.toMatch(/(?<!never |not |n't )\bdelay(ing)? (your )?evacuat/i);
      expect(text, t.id).not.toMatch(/before (you )?evacuat\w*,? (finish|complete)/i);
    }
  });
});

describe("diffTaskIds", () => {
  it("reports added, removed and kept IDs", () => {
    expect(diffTaskIds(["a", "b", "c"], ["b", "c", "d"])).toEqual({ added: ["d"], removed: ["a"], kept: ["b", "c"] });
  });
});
