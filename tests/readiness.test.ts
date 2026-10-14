import { describe, expect, it } from "vitest";
import { calculateReadiness } from "@/lib/readiness";

const tasks = [{ id: "one" }, { id: "two" }, { id: "three" }];

describe("checklist completion", () => {
  it("handles no tasks", () =>
    expect(calculateReadiness([], {})).toEqual({
      percentage: 0,
      completed: 0,
      remaining: 0,
      applicable: 0,
      notApplicable: 0,
    }));
  it("handles no completed tasks", () =>
    expect(calculateReadiness(tasks, {})).toMatchObject({
      percentage: 0,
      completed: 0,
      remaining: 3,
    }));
  it("rounds partial progress to a whole percentage", () =>
    expect(calculateReadiness(tasks, { one: "done" })).toMatchObject({
      percentage: 33,
      completed: 1,
      remaining: 2,
    }));
  it("handles all completed tasks", () =>
    expect(
      calculateReadiness(tasks, { one: "done", two: "done", three: "done" }),
    ).toMatchObject({ percentage: 100, completed: 3, remaining: 0 }));
  it("excludes not applicable tasks", () =>
    expect(
      calculateReadiness(tasks, { one: "done", two: "not-applicable" }),
    ).toEqual({
      percentage: 50,
      completed: 1,
      remaining: 1,
      applicable: 2,
      notApplicable: 1,
    }));
  it("counts each ID once and ignores unrelated saved states", () =>
    expect(
      calculateReadiness([...tasks, tasks[0], tasks[1]], {
        one: "done",
        missing: "done",
      }),
    ).toMatchObject({ percentage: 33, completed: 1, applicable: 3 }));
  it("does not invent a perfect score when all tasks are not applicable", () =>
    expect(
      calculateReadiness(tasks, {
        one: "not-applicable",
        two: "not-applicable",
        three: "not-applicable",
      }),
    ).toMatchObject({ percentage: 0, applicable: 0, notApplicable: 3 }));
});
