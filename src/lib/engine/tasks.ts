import type { HazardId, Profile } from "@/lib/schema";
import { TASKS, type HouseholdTag, type TaskDefinition } from "@/lib/data/tasks";
import { PRIORITY_RANK, type Priority } from "@/lib/data/categories";
import { getHazard } from "@/lib/data/hazards";
import { deriveContext, TAG_REASON, type HouseholdContext } from "@/lib/engine/context";

/** Bump when task content or rules change in a way that should trigger regeneration. */
export const ENGINE_VERSION = "1.0.0";

export interface GeneratedTask extends TaskDefinition {
  /** Effective priority after hazard emphasis is applied. */
  effectivePriority: Priority;
  /** Hazards from the profile that caused this task to be included or escalated. */
  matchedHazards: HazardId[];
  /** Household facts that caused this task to be included. */
  matchedTags: HouseholdTag[];
  /** Plain-language explanation of why the task is in the plan. */
  reason: string;
  /** Number of household-specific needs this task addresses. Used as a tiebreaker. */
  relevance: number;
  /** Position in the task library — final deterministic tiebreaker. */
  order: number;
}

export type InclusionResult =
  | { included: true; matchedHazards: HazardId[]; matchedTags: HouseholdTag[]; emphasized: boolean }
  | { included: false };

/** Pure rule evaluation for one task against a household. */
export function evaluateTask(task: TaskDefinition, ctx: HouseholdContext): InclusionResult {
  if (task.detailOnly && !ctx.detailed) return { included: false };

  const matchedTags: HouseholdTag[] = [];
  if (task.requires) {
    for (const tag of task.requires) {
      if (!ctx.tags.has(tag)) return { included: false };
      matchedTags.push(tag);
    }
  }
  if (task.requiresAny) {
    const any = task.requiresAny.filter((tag) => ctx.tags.has(tag));
    if (any.length === 0) return { included: false };
    matchedTags.push(...any);
  }

  let matchedHazards: HazardId[] = [];
  if (task.hazards) {
    matchedHazards = task.hazards.filter((h) => ctx.hazards.has(h));
    if (matchedHazards.length === 0) return { included: false };
  }

  let emphasized = false;
  if (task.emphasizedFor) {
    const emph = task.emphasizedFor.filter((h) => ctx.hazards.has(h));
    if (emph.length > 0) {
      emphasized = true;
      matchedHazards = [...new Set([...matchedHazards, ...emph])];
    }
  }

  return { included: true, matchedHazards, matchedTags: [...new Set(matchedTags)], emphasized };
}

function listToSentence(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function explainInclusion(
  task: TaskDefinition,
  matchedHazards: HazardId[],
  matchedTags: HouseholdTag[],
  emphasized: boolean,
): string {
  const hazardNames = matchedHazards.map((h) => getHazard(h).label.toLowerCase());
  const tagReasons = matchedTags.filter((t) => t !== "multi-person").map((t) => TAG_REASON[t]);

  if (task.hazards && tagReasons.length > 0) {
    return `Included because you're preparing for ${listToSentence(hazardNames)} and ${listToSentence(tagReasons)}.`;
  }
  if (task.hazards) {
    return `Included because you're preparing for ${listToSentence(hazardNames)}.`;
  }
  if (tagReasons.length > 0) {
    const base = `Included because ${listToSentence(tagReasons)}.`;
    return emphasized ? `${base} Prioritized for ${listToSentence(hazardNames)}.` : base;
  }
  if (emphasized) {
    return `A core step in every plan, prioritized because you're preparing for ${listToSentence(hazardNames)}.`;
  }
  return "A core preparedness step included in every FORTIS plan.";
}

/**
 * Compare two generated tasks for display priority:
 * effective priority → household-specific needs → hazard-specific → library order.
 */
export function compareTasks(a: GeneratedTask, b: GeneratedTask): number {
  return (
    PRIORITY_RANK[a.effectivePriority] - PRIORITY_RANK[b.effectivePriority] ||
    b.relevance - a.relevance ||
    Number(b.matchedHazards.length > 0) - Number(a.matchedHazards.length > 0) ||
    a.order - b.order
  );
}

/** Tags describing a specific need of someone in the household (as opposed to logistics). */
const NEED_TAGS: ReadonlySet<HouseholdTag> = new Set([
  "children",
  "older-adults",
  "pets",
  "mobility",
  "powered-medical",
  "communication",
  "evacuation-assistance",
]);

/** Emphasis raises a task one level — a recommended step never jumps straight to critical. */
function raise(priority: Priority): Priority {
  return priority === "recommended" ? "high" : "critical";
}

/**
 * The rules engine. Deterministic: the same profile always yields the same
 * tasks in the same order. Each task ID appears at most once.
 */
export function generateTasks(profile: Profile, library: readonly TaskDefinition[] = TASKS): GeneratedTask[] {
  const ctx = deriveContext(profile);
  const seen = new Set<string>();
  const out: GeneratedTask[] = [];

  library.forEach((task, order) => {
    if (seen.has(task.id)) return; // defensive de-duplication
    const result = evaluateTask(task, ctx);
    if (!result.included) return;
    seen.add(task.id);

    const effectivePriority: Priority = result.emphasized ? raise(task.priority) : task.priority;
    out.push({
      ...task,
      effectivePriority,
      matchedHazards: result.matchedHazards,
      matchedTags: result.matchedTags,
      reason: explainInclusion(task, result.matchedHazards, result.matchedTags, result.emphasized),
      relevance: result.matchedTags.filter((t) => NEED_TAGS.has(t)).length,
      order,
    });
  });

  return out.sort(compareTasks);
}

const TASK_INDEX = new Map(TASKS.map((t, i) => [t.id, { task: t, order: i }]));

export function getTaskDefinition(id: string): TaskDefinition | undefined {
  return TASK_INDEX.get(id)?.task;
}

export interface RegenerationDiff {
  added: string[];
  removed: string[];
  kept: string[];
}

export function diffTaskIds(previous: readonly string[], next: readonly string[]): RegenerationDiff {
  const prev = new Set(previous);
  const nxt = new Set(next);
  return {
    added: next.filter((id) => !prev.has(id)),
    removed: previous.filter((id) => !nxt.has(id)),
    kept: next.filter((id) => prev.has(id)),
  };
}
