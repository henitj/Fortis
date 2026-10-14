import { describe, expect, it } from "vitest";
import {
  emptySupplySettings,
  getSupplyMath,
  getSupplyProgress,
  getSupplyRows,
  safeQuantity,
} from "@/lib/supply-calculations";
import { profile } from "./fixtures";

describe("supply calculations", () => {
  it("plans one adult for three days", () => {
    const math = getSupplyMath(profile());
    expect(math).toMatchObject({
      people: 1,
      days: 3,
      personDays: 3,
      baselineWaterGallons: 3,
      suggestedMeals: 9,
    });
    expect(
      getSupplyRows(profile(), emptySupplySettings()).find(
        (row) => row.id === "people-water",
      )?.planned,
    ).toBe(3);
  });

  it("plans two adults and two children for seven days without counting older adults twice", () => {
    const input = profile({
      household: {
        ...profile().household,
        adults: 2,
        children: 2,
        olderAdults: 1,
      },
      preferences: { ...profile().preferences, days: 7 },
    });
    expect(getSupplyMath(input)).toMatchObject({
      people: 4,
      days: 7,
      personDays: 28,
      baselineWaterGallons: 28,
      suggestedMeals: 84,
    });
  });

  it("excludes pet supplies when there are zero pets", () => {
    const rows = getSupplyRows(profile(), emptySupplySettings());
    expect(
      rows.some(
        (row) =>
          row.id === "pet-water" ||
          row.id === "pet-food" ||
          row.id === "pet-carriers",
      ),
    ).toBe(false);
    expect(getSupplyMath(profile()).petWaterGallons).toBe(0);
  });

  it("calculates multiple pets separately with a configurable water estimate", () => {
    const input = profile({
      household: { ...profile().household, pets: 3 },
      preferences: { ...profile().preferences, days: 7 },
    });
    expect(getSupplyMath(input).petWaterGallons).toBe(10.5);
    const settings = { ...emptySupplySettings(), petGallonsPerDay: 1.25 };
    expect(
      getSupplyMath(input, settings.petGallonsPerDay).petWaterGallons,
    ).toBe(26.25);
    expect(
      getSupplyRows(input, settings).find((row) => row.id === "pet-water")
        ?.planned,
    ).toBe(26.25);
    expect(
      getSupplyRows(input, settings).find((row) => row.id === "pet-food")
        ?.planned,
    ).toBe(21);
  });

  it("recalculates on duration change while keeping explicitly customized targets", () => {
    const base = profile({ household: { ...profile().household, adults: 2 } });
    const longer = profile({
      ...base,
      preferences: { ...base.preferences, days: 14 },
    });
    expect(
      getSupplyRows(base, emptySupplySettings()).find(
        (row) => row.id === "people-water",
      )?.planned,
    ).toBe(6);
    expect(
      getSupplyRows(longer, emptySupplySettings()).find(
        (row) => row.id === "people-water",
      )?.planned,
    ).toBe(28);
    const settings = {
      ...emptySupplySettings(),
      items: { "people-water": { plannedOverride: 40, available: 10 } },
    };
    expect(
      getSupplyRows(longer, settings).find((row) => row.id === "people-water"),
    ).toMatchObject({
      baseline: 28,
      planned: 40,
      available: 10,
      remaining: 30,
      custom: true,
    });
  });

  it("does not propagate invalid or negative numbers", () => {
    expect(safeQuantity(-2)).toBe(0);
    expect(safeQuantity(NaN)).toBe(0);
    expect(safeQuantity(Infinity)).toBe(0);
    const rows = getSupplyRows(profile(), {
      petGallonsPerDay: 0.5,
      items: { "people-water": { plannedOverride: -8, available: Infinity } },
    });
    expect(rows.find((row) => row.id === "people-water")).toMatchObject({
      planned: 0,
      available: 0,
      remaining: 0,
    });
  });

  it("counts covered items instead of mixing quantities with incompatible units", () => {
    const input = profile();
    const settings = {
      ...emptySupplySettings(),
      items: { "people-water": { available: 4 }, meals: { available: 9 } },
    };
    const progress = getSupplyProgress(getSupplyRows(input, settings));
    expect(progress.available).toBe(2);
    expect(progress.needed).toBe(progress.total - 2);
  });
});
