import type { TaskStatus } from "@/lib/schema";

export interface ReadinessSummary {
  /** Tasks counted toward the score (generated and not marked "not applicable"). */
  applicable: number;
  completed: number;
  remaining: number;
  notApplicable: number;
  /**
   * Whole-number completion percentage, or `null` when no tasks are applicable.
   * Rounded **down** so 100% is only shown when every applicable task is done.
   */
  percentage: number | null;
}

/**
 * Preparedness checklist completion:
 *   completedApplicableTasks / totalApplicableTasks × 100
 *
 * - Each task ID is counted once, even if it appears in the list more than once.
 * - Tasks marked "not applicable" are excluded from numerator and denominator.
 * - Status entries for tasks no longer in the plan are ignored.
 */
export function computeReadiness(
  taskIds: readonly string[],
  status: Readonly<Record<string, TaskStatus | undefined>>,
): ReadinessSummary {
  const unique = [...new Set(taskIds)];
  let notApplicable = 0;
  let completed = 0;
  for (const id of unique) {
    const s = status[id];
    if (s === "na") notApplicable += 1;
    else if (s === "done") completed += 1;
  }
  const applicable = unique.length - notApplicable;
  return {
    applicable,
    completed,
    remaining: applicable - completed,
    notApplicable,
    percentage: applicable === 0 ? null : Math.floor((completed / applicable) * 100),
  };
}

export type ReadinessStage = "none" | "starting" | "building" | "advanced" | "complete";

/** Descriptive stage for copy only — deliberately coarse to avoid false precision. */
export function readinessStage(summary: ReadinessSummary): ReadinessStage {
  if (summary.percentage === null) return "none";
  if (summary.remaining === 0) return "complete";
  if (summary.percentage < 25) return "starting";
  if (summary.percentage < 75) return "building";
  return "advanced";
}

export const STAGE_COPY: Record<ReadinessStage, { title: string; body: string }> = {
  none: {
    title: "No applicable tasks",
    body: "Every task is marked not applicable. Edit your plan or restore tasks to track progress.",
  },
  starting: {
    title: "Getting started",
    body: "Start with your priority actions — they cover the most important gaps first.",
  },
  building: {
    title: "Building momentum",
    body: "You've covered a solid share of your checklist. Keep working through the priorities.",
  },
  advanced: {
    title: "Well underway",
    body: "Most of your checklist is complete. Finish the remaining items, then review your plan regularly.",
  },
  complete: {
    title: "Checklist complete",
    body: "Every applicable task is checked off. Review your supplies and plan at least twice a year.",
  },
};
