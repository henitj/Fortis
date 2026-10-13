import { describe, expect, it } from "vitest";
import { computeReadiness, readinessStage } from "@/lib/engine/readiness";

describe("computeReadiness", () => {
  it("returns 0% with no completions", () => {
    expect(computeReadiness(["a", "b"], {})).toMatchObject({ applicable: 2, completed: 0, remaining: 2, percentage: 0 });
  });

  it("calculates completed / applicable × 100", () => {
    expect(computeReadiness(["a", "b", "c", "d"], { a: "done" }).percentage).toBe(25);
  });

  it("excludes not-applicable tasks from numerator and denominator", () => {
    const r = computeReadiness(["a", "b", "c", "d"], { a: "done", b: "na" });
    expect(r).toMatchObject({ applicable: 3, completed: 1, notApplicable: 1, remaining: 2, percentage: 33 });
  });

  it("counts each task ID once", () => {
    const r = computeReadiness(["a", "a", "b"], { a: "done" });
    expect(r).toMatchObject({ applicable: 2, completed: 1, percentage: 50 });
  });

  it("ignores statuses for tasks that are no longer in the plan", () => {
    expect(computeReadiness(["a"], { a: "done", z: "done" })).toMatchObject({ completed: 1, applicable: 1, percentage: 100 });
  });

  it("returns null when nothing is applicable", () => {
    expect(computeReadiness([], {}).percentage).toBeNull();
    expect(computeReadiness(["a"], { a: "na" }).percentage).toBeNull();
    expect(readinessStage(computeReadiness([], {}))).toBe("none");
  });

  it("never shows 100% until every applicable task is complete", () => {
    const ids = Array.from({ length: 200 }, (_, i) => `t${i}`);
    const status = Object.fromEntries(ids.slice(0, 199).map((id) => [id, "done" as const]));
    const r = computeReadiness(ids, status);
    expect(r.percentage).toBe(99);
    expect(readinessStage(r)).toBe("advanced");
  });

  it("reports complete when all applicable tasks are done", () => {
    const r = computeReadiness(["a", "b"], { a: "done", b: "na" });
    expect(r.percentage).toBe(100);
    expect(readinessStage(r)).toBe("complete");
  });
});
