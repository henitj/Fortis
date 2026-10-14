import { describe, expect, it } from "vitest";
import {
  createPlan,
  loadPlan,
  parseStoredPlan,
  resetPlan,
  savePlan,
  STORAGE_KEY,
} from "@/lib/storage";
import type { StorageLike } from "@/lib/storage";
import { profile } from "./fixtures";

describe("versioned local storage", () => {
  it("saves and reloads a valid plan including edits", () => {
    const plan = createPlan(
      profile({ hazards: ["storms"] }),
      "2026-10-13T00:00:00.000Z",
    );
    plan.taskStates["water-store"] = "done";
    plan.supplies.items["people-water"] = { available: 3, plannedOverride: 4 };
    plan.communication.primaryMeeting = "The library";
    expect(savePlan(plan, window.localStorage)).toBe(true);
    expect(loadPlan(window.localStorage)).toEqual({ status: "loaded", plan });
  });
  it("reports malformed JSON without throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadPlan(window.localStorage)).toMatchObject({ status: "invalid" });
  });
  it("rejects an unsupported or older schema version", () => {
    expect(
      parseStoredPlan(
        JSON.stringify({ ...createPlan(profile()), schemaVersion: 0 }),
      ),
    ).toMatchObject({
      status: "invalid",
      reason: expect.stringContaining("unsupported"),
    });
    window.localStorage.setItem("fortis:plan:v0", "old data");
    expect(loadPlan(window.localStorage)).toMatchObject({
      status: "invalid",
      reason: expect.stringContaining("older"),
    });
  });
  it("rejects invalid or negative quantities and inconsistent counts", () => {
    const plan = createPlan(profile());
    plan.supplies.items["people-water"] = { available: -10 };
    expect(parseStoredPlan(JSON.stringify(plan)).status).toBe("invalid");
    const other = createPlan(
      profile({ household: { ...profile().household, olderAdults: 2 } }),
    );
    expect(savePlan(other, window.localStorage)).toBe(false);
  });
  it("rejects unknown supply IDs and duplicate contact IDs", () => {
    const unknown = createPlan(profile());
    const raw = JSON.parse(JSON.stringify(unknown)) as Record<string, unknown>;
    (raw.supplies as { items: Record<string, unknown> }).items[
      "unrecognized-supply"
    ] = { available: 2 };
    expect(parseStoredPlan(JSON.stringify(raw)).status).toBe("invalid");
    const duplicate = createPlan(profile());
    duplicate.communication.contacts = [
      { id: "same", label: "A", phone: "" },
      { id: "same", label: "B", phone: "" },
    ];
    expect(parseStoredPlan(JSON.stringify(duplicate)).status).toBe("invalid");
  });
  it("resets stored data only when asked", () => {
    savePlan(createPlan(profile()), window.localStorage);
    expect(resetPlan(window.localStorage)).toBe(true);
    expect(loadPlan(window.localStorage)).toEqual({ status: "empty" });
  });
  it("handles storage that is unavailable on read, write, or reset", () => {
    const blocked: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadPlan(blocked)).toEqual({ status: "unavailable" });
    expect(savePlan(createPlan(profile()), blocked)).toBe(false);
    expect(resetPlan(blocked)).toBe(false);
    expect(loadPlan(null)).toEqual({ status: "unavailable" });
  });
  it("rejects oversized data and incomplete objects", () => {
    expect(parseStoredPlan("x".repeat(1_000_001)).status).toBe("invalid");
    expect(parseStoredPlan(JSON.stringify({ schemaVersion: 1 })).status).toBe(
      "invalid",
    );
  });
});
