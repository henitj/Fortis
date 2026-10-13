import { describe, expect, it } from "vitest";
import {
  calculateFood,
  calculateWater,
  DEFAULT_SUPPLY_SETTINGS,
  gallonsToLiters,
  generateSupplies,
  resolveSupply,
  summarizeSupplies,
} from "@/lib/engine/supplies";
import { makeProfile } from "./helpers";

const settings = DEFAULT_SUPPLY_SETTINGS;

describe("water calculation", () => {
  it("uses people = adults + children and 1 gallon per person per day", () => {
    const w = calculateWater(makeProfile({ household: { adults: 2, children: 2 }, preferences: { durationDays: 7 } }), settings);
    expect(w.people).toBe(4);
    expect(w.baselineGallons).toBe(28);
    expect(w.householdGallons).toBe(28);
  });

  it("does not add older adults to the headcount a second time", () => {
    const w = calculateWater(makeProfile({ household: { adults: 2, olderAdults: 2, children: 0 }, preferences: { durationDays: 3 } }), settings);
    expect(w.people).toBe(2);
    expect(w.baselineGallons).toBe(6);
  });

  it("calculates pet water separately and never counts pets as people", () => {
    const w = calculateWater(
      makeProfile({ household: { adults: 1, pets: 2 }, preferences: { durationDays: 14 } }),
      { ...settings, petWaterGallonsPerDay: 0.5 },
    );
    expect(w.people).toBe(1);
    expect(w.baselineGallons).toBe(14);
    expect(w.petGallons).toBe(14);
    expect(w.totalGallons).toBe(28);
  });

  it("doubles household water with the hot-weather buffer", () => {
    const w = calculateWater(makeProfile({ household: { adults: 1 }, preferences: { durationDays: 3 } }), { ...settings, hotWeatherBuffer: true });
    expect(w.baselineGallons).toBe(3);
    expect(w.householdGallons).toBe(6);
  });

  it("converts gallons to liters", () => {
    expect(gallonsToLiters(1)).toBe(3.8);
    expect(gallonsToLiters(21)).toBe(79.5);
  });
});

describe("food calculation", () => {
  it("computes person-days and meals", () => {
    const f = calculateFood(makeProfile({ household: { adults: 2, children: 1, pets: 1 }, preferences: { durationDays: 3 } }));
    expect(f).toMatchObject({ personDays: 9, meals: 27, petDays: 3 });
  });
});

describe("supply list", () => {
  it("adds pet, child and accessibility items only when relevant", () => {
    const base = generateSupplies(makeProfile(), settings).map((i) => i.id);
    expect(base).not.toContain("pet-carriers");
    expect(base).not.toContain("child-comfort");
    expect(base).not.toContain("medical-backup-power");
    const full = generateSupplies(
      makeProfile({ household: { pets: 2, children: 1, poweredMedical: "yes", mobilityNeeds: "yes" } }),
      settings,
    );
    const fullIds = full.map((i) => i.id);
    expect(fullIds).toEqual(expect.arrayContaining(["pet-carriers", "water-pets", "child-comfort", "medical-backup-power", "mobility-backups"]));
    expect(full.find((i) => i.id === "pet-carriers")!.recommended).toBe(2);
    expect(full.find((i) => i.id === "medical-backup-power")!.note).toMatch(/equipment provider/);
  });

  it("has unique supply IDs", () => {
    const items = generateSupplies(
      makeProfile({ household: { pets: 1, children: 1, olderAdults: 1, mobilityNeeds: "yes", poweredMedical: "yes", communicationNeeds: "yes" }, hazards: ["wildfires", "extreme-cold"] }),
      settings,
    );
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("matches water item quantity to the calculation", () => {
    const p = makeProfile({ household: { adults: 3 }, preferences: { durationDays: 7 } });
    const item = generateSupplies(p, settings).find((i) => i.id === "water-household")!;
    expect(item.recommended).toBe(21);
    expect(item.formula).toBe("3 people × 7 days × 1 gal");
  });
});

describe("supply status and summary", () => {
  const item = { id: "x", name: "X", category: "water" as const, unit: "u", recommended: 4, formula: "" };
  const state = (targets = {}, onHand = {}) => ({ targets, onHand, settings });

  it("resolves statuses", () => {
    expect(resolveSupply(item, state()).status).toBe("needed");
    expect(resolveSupply(item, state({}, { x: 2 })).status).toBe("partial");
    expect(resolveSupply(item, state({}, { x: 4 })).status).toBe("available");
    expect(resolveSupply(item, state({ x: 0 })).status).toBe("skipped");
    expect(resolveSupply(item, state({ x: 6 }, { x: 4 }))).toMatchObject({ status: "partial", target: 6, isCustomTarget: true });
  });

  it("summarizes totals and excludes skipped items", () => {
    const items = [
      resolveSupply(item, state({}, { x: 4 })),
      resolveSupply({ ...item, id: "y" }, state()),
      resolveSupply({ ...item, id: "z" }, state({ z: 0 })),
    ];
    const s = summarizeSupplies(items);
    expect(s).toMatchObject({ planned: 2, available: 1, needed: 1, percentage: 50 });
    expect(s.byCategory).toEqual([{ id: "water", label: "Water", planned: 2, available: 1 }]);
  });
});
