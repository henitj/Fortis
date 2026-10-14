import type { TaskStatus } from "./types";

export interface Readiness {
  percentage: number;
  completed: number;
  remaining: number;
  applicable: number;
  notApplicable: number;
}

export function calculateReadiness(
  tasks: { id: string }[],
  states: Record<string, TaskStatus>,
): Readiness {
  const ids = new Set(tasks.map((task) => task.id));
  let completed = 0;
  let notApplicable = 0;
  for (const id of ids) {
    if (states[id] === "not-applicable") notApplicable++;
    else if (states[id] === "done") completed++;
  }
  const applicable = ids.size - notApplicable;
  return {
    percentage:
      applicable === 0 ? 0 : Math.round((completed / applicable) * 100),
    completed,
    remaining: applicable - completed,
    applicable,
    notApplicable,
  };
}
