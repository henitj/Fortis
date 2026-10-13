import { describe, expect, it } from "vitest";
import { buildExport, loadPlan, parseImport, savePlan, STORAGE_KEY, type StorageLike } from "@/lib/storage";
import { createPlan, regeneratePlan } from "@/lib/plan";
import { makeProfile } from "./helpers";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k]! : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

describe("storage", () => {
  it("round-trips a plan", () => {
    const s = memoryStorage();
    const plan = createPlan(makeProfile({ hazards: ["flooding"] }));
    expect(savePlan(s, plan)).toEqual({ ok: true });
    const loaded = loadPlan(s);
    expect(loaded.status).toBe("ok");
    if (loaded.status === "ok") expect(loaded.plan).toEqual(plan);
  });

  it("uses a versioned key", () => {
    expect(STORAGE_KEY).toBe("fortis:plan:v1");
  });

  it("reports empty storage", () => {
    expect(loadPlan(memoryStorage()).status).toBe("empty");
  });

  it("reports unavailable storage", () => {
    expect(loadPlan(null).status).toBe("unavailable");
    expect(savePlan(null, createPlan(makeProfile()))).toEqual({ ok: false, reason: "unavailable" });
  });

  it("recovers gracefully from malformed JSON", () => {
    const r = loadPlan(memoryStorage({ [STORAGE_KEY]: "{not json" }));
    expect(r.status).toBe("invalid");
  });

  it("rejects structurally invalid plans", () => {
    const plan = createPlan(makeProfile());
    const broken = { ...plan, profile: { ...plan.profile, household: { ...plan.profile.household, adults: -3 } } };
    expect(loadPlan(memoryStorage({ [STORAGE_KEY]: JSON.stringify(broken) })).status).toBe("invalid");
    const olderThanAdults = { ...plan, profile: { ...plan.profile, household: { ...plan.profile.household, adults: 1, olderAdults: 3 } } };
    expect(loadPlan(memoryStorage({ [STORAGE_KEY]: JSON.stringify(olderThanAdults) })).status).toBe("invalid");
  });

  it("handles storage that throws on write", () => {
    const s: StorageLike = {
      getItem: () => null,
      removeItem: () => {},
      setItem: () => {
        const e = new Error("full");
        e.name = "QuotaExceededError";
        throw e;
      },
    };
    expect(savePlan(s, createPlan(makeProfile()))).toEqual({ ok: false, reason: "quota" });
  });
});

describe("import / export", () => {
  it("accepts a valid export", () => {
    const plan = createPlan(makeProfile());
    const r = parseImport(JSON.stringify(buildExport(plan)));
    expect(r.ok).toBe(true);
  });

  it("rejects invalid files without throwing", () => {
    expect(parseImport("nope").ok).toBe(false);
    expect(parseImport(JSON.stringify({ app: "Other" })).ok).toBe(false);
    expect(parseImport("x".repeat(600 * 1024)).ok).toBe(false);
  });
});

describe("regeneration", () => {
  it("preserves completion state and reports the diff", () => {
    const plan = createPlan(makeProfile());
    plan.taskStatus["core-water-supply"] = "done";
    const { plan: next, diff } = regeneratePlan(plan, makeProfile({ hazards: ["flooding"] }));
    expect(next.taskStatus["core-water-supply"]).toBe("done");
    expect(diff.added).toContain("flood-risk");
    expect(diff.removed).toEqual([]);
    expect(next.generatedTaskIds).toContain("flood-risk");
  });

  it("turns on the hot-weather buffer when extreme heat is added", () => {
    const plan = createPlan(makeProfile());
    expect(plan.supplies.settings.hotWeatherBuffer).toBe(false);
    const { plan: next } = regeneratePlan(plan, makeProfile({ hazards: ["extreme-heat"] }));
    expect(next.supplies.settings.hotWeatherBuffer).toBe(true);
  });
});
