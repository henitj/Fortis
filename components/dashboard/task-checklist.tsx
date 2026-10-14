"use client";

import { useState } from "react";
import { ExternalLink, ListFilter } from "lucide-react";
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  TASK_CATEGORIES,
} from "@/lib/preparedness-data";
import { getTaskReason } from "@/lib/rules-engine";
import type {
  HouseholdProfile,
  PreparednessTask,
  TaskCategory,
  TaskStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { id: "all", label: "All tasks" },
  { id: "todo", label: "To do" },
  { id: "done", label: "Completed" },
  { id: "not-applicable", label: "Not applicable" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

export function TaskChecklist({
  tasks,
  profile,
  states,
  onStatus,
}: {
  tasks: PreparednessTask[];
  profile: HouseholdProfile;
  states: Record<string, TaskStatus>;
  onStatus: (id: string, status: TaskStatus) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const visible = tasks.filter(
    (task) =>
      (category === "all" || task.category === category) &&
      (filter === "all" || (states[task.id] ?? "todo") === filter),
  );
  return (
    <section
      id="actions"
      className="scroll-mt-28"
      aria-labelledby="actions-title"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-forest">
            01 / Action plan
          </p>
          <h2
            id="actions-title"
            className="font-display mt-2 text-2xl font-extrabold tracking-[-0.045em] sm:text-[30px]"
          >
            Your action checklist.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate">
            {tasks.length} relevant tasks, selected by transparent rules. Mark
            an item not applicable if it doesn&apos;t fit your situation.
          </p>
        </div>
        <span className="rounded-xl border border-line bg-white px-4 py-3 text-xs font-bold text-forest">
          {
            tasks.filter((task) => (states[task.id] ?? "todo") === "todo")
              .length
          }{" "}
          to do
        </span>
      </div>
      <div className="card overflow-hidden [overflow-wrap:anywhere]">
        <div className="border-b border-line bg-[#fcfcfa] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate">
              <ListFilter size={16} /> Filter by status
            </div>
            <label
              className="flex w-full min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-slate sm:w-auto"
              htmlFor="category-filter"
            >
              Category{" "}
              <select
                id="category-filter"
                className="min-h-10 w-full min-w-0 max-w-full rounded-lg border border-[#cbd1d2] bg-white px-3 text-xs font-semibold text-ink sm:w-auto sm:max-w-[210px]"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as TaskCategory | "all")
                }
              >
                <option value="all">All categories</option>
                {TASK_CATEGORIES.filter((item) =>
                  tasks.some((task) => task.category === item.id),
                ).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label="Checklist status filter"
          >
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-bold transition-colors ${filter === item.id ? "bg-ink text-white" : "border border-line bg-white text-slate hover:border-forest hover:text-ink"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {visible.length ? (
          TASK_CATEGORIES.map((group) => {
            const items = visible
              .filter((task) => task.category === group.id)
              .sort(
                (a, b) =>
                  PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
              );
            if (!items.length) return null;
            return (
              <section key={group.id} aria-labelledby={`tasks-${group.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-[#f7f8f5] px-5 py-3.5 sm:px-6">
                  <h3
                    id={`tasks-${group.id}`}
                    className="font-display text-sm font-extrabold tracking-[-0.02em]"
                  >
                    {group.label} actions
                  </h3>
                  <span className="text-[11px] font-semibold text-slate">
                    {items.length} {items.length === 1 ? "action" : "actions"}
                  </span>
                </div>
                <div className="divide-y divide-line">
                  {items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      profile={profile}
                      state={states[task.id] ?? "todo"}
                      onStatus={onStatus}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-bold text-ink">No tasks in this view.</p>
            <p className="mt-1 text-xs text-slate">
              Try a different status or category to see more of your plan.
            </p>
            <Button
              variant="outline"
              size="small"
              className="mt-4"
              onClick={() => {
                setFilter("all");
                setCategory("all");
              }}
            >
              Show all tasks
            </Button>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate">
        Why these tasks? Core tasks appear in every plan. Other tasks are added
        only for your selected hazards or household needs. Your choices are not
        live risk predictions.
      </p>
    </section>
  );
}

function TaskRow({
  task,
  profile,
  state,
  onStatus,
}: {
  task: PreparednessTask;
  profile: HouseholdProfile;
  state: TaskStatus;
  onStatus: (id: string, status: TaskStatus) => void;
}) {
  const detailed = profile.preferences.detail === "detailed";
  return (
    <div
      className={`flex gap-3 px-5 py-4 sm:gap-4 sm:px-6 ${state === "done" ? "bg-[#f8faf7]" : ""}`}
    >
      <input
        id={`task-${task.id}`}
        type="checkbox"
        className="mt-0.5 h-[20px] w-[20px] shrink-0 cursor-pointer disabled:cursor-not-allowed"
        checked={state === "done"}
        disabled={state === "not-applicable"}
        aria-label={`Mark ${task.title} ${state === "done" ? "incomplete" : "complete"}`}
        onChange={(event) =>
          onStatus(task.id, event.target.checked ? "done" : "todo")
        }
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={`task-${task.id}`}
            className={`text-sm font-bold leading-5 ${state === "done" ? "text-slate line-through decoration-slate/55" : "text-ink"}`}
          >
            {task.title}
          </label>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${state === "done" ? "bg-[#e7f1e9] text-forest" : state === "not-applicable" ? "bg-paper text-slate" : task.priority === "essential" ? "bg-[#f9eed8] text-[#78500d]" : "bg-paper text-slate"}`}
          >
            {state === "done"
              ? "Done"
              : state === "not-applicable"
                ? "Not applicable"
                : PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate">{task.description}</p>
        <p className="mt-1 text-[11px] font-semibold leading-5 text-forest">
          {getTaskReason(task, profile)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {detailed && task.estimatedMinutes && (
            <span className="text-[11px] text-slate">
              About {task.estimatedMinutes} min to plan
            </span>
          )}
          {detailed && task.officialUrl && (
            <a
              href={task.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest underline underline-offset-2 hover:text-ink"
            >
              Official reference <ExternalLink size={11} />
            </a>
          )}
          <button
            type="button"
            onClick={() =>
              onStatus(
                task.id,
                state === "not-applicable" ? "todo" : "not-applicable",
              )
            }
            className="rounded text-[11px] font-bold text-slate underline underline-offset-2 hover:text-ink"
          >
            {state === "not-applicable"
              ? "Restore to plan"
              : "Mark not applicable"}
            <span className="sr-only">: {task.title}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
