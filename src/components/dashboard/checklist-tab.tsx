"use client";

import * as React from "react";
import { CircleCheck, Layers, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_ICONS } from "@/components/plan/icons";
import { TASK_CATEGORIES, type TaskCategoryId } from "@/lib/data/categories";
import type { GeneratedTask } from "@/lib/engine/tasks";
import { cn } from "@/lib/utils";
import { TaskItem } from "./task-item";
import { Notice, SectionHeader } from "./shared";
import type { PlanView } from "./use-plan-view";

type Filter = "all" | "todo" | "done";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "todo", label: "To do" },
  { id: "done", label: "Completed" },
];

export function ChecklistTab({ view, initialCategory }: { view: PlanView; initialCategory: string | null }) {
  const { tasks, plan, readiness } = view;
  const status = plan.taskStatus;
  const [filter, setFilter] = React.useState<Filter>("all");
  const [category, setCategory] = React.useState<TaskCategoryId | "all">(
    (TASK_CATEGORIES.find((c) => c.id === initialCategory)?.id ?? "all") as TaskCategoryId | "all",
  );

  const categories = TASK_CATEGORIES.map((c) => {
    const inCat = tasks.filter((t) => t.category === c.id);
    const applicable = inCat.filter((t) => status[t.id] !== "na");
    return {
      ...c,
      total: applicable.length,
      done: applicable.filter((t) => status[t.id] === "done").length,
      count: inCat.length,
    };
  }).filter((c) => c.count > 0);

  const matchesFilter = (t: GeneratedTask) => {
    const s = status[t.id];
    if (filter === "todo") return !s;
    if (filter === "done") return s === "done";
    return true;
  };

  const visible = tasks.filter((t) => (category === "all" || t.category === category) && matchesFilter(t));
  const grouped = categories
    .filter((c) => category === "all" || c.id === category)
    .map((c) => ({ ...c, tasks: visible.filter((t) => t.category === c.id) }))
    .filter((g) => g.tasks.length > 0);

  const counts = {
    all: tasks.filter((t) => category === "all" || t.category === category).length,
    todo: tasks.filter((t) => (category === "all" || t.category === category) && !status[t.id]).length,
    done: tasks.filter((t) => (category === "all" || t.category === category) && status[t.id] === "done").length,
  };

  return (
    <div>
      <SectionHeader
        title="Preparedness checklist"
        description={
          <>
            {readiness.completed} of {readiness.applicable} applicable tasks complete. Mark anything that doesn&apos;t apply to
            your household as <span className="font-medium text-navy-600">Not applicable</span> to remove it from your score.
          </>
        }
      />

      {readiness.applicable > 0 && readiness.remaining === 0 ? (
        <Notice icon={PartyPopper} tone="success" title="Checklist complete" className="mt-6">
          Every applicable task is done. Preparedness is ongoing — revisit your plan at least twice a year and after any change
          in your household.
        </Notice>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        {/* Category navigation */}
        <nav aria-label="Task categories" className="lg:sticky lg:top-36 lg:self-start">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            <CategoryButton
              active={category === "all"}
              onClick={() => setCategory("all")}
              icon={Layers}
              label="All categories"
              done={readiness.completed}
              total={readiness.applicable}
            />
            {categories.map((c) => (
              <CategoryButton
                key={c.id}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
                icon={CATEGORY_ICONS[c.id]}
                label={c.label}
                shortLabel={c.short}
                done={c.done}
                total={c.total}
              />
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <div role="radiogroup" aria-label="Filter tasks" className="inline-flex rounded-xl border border-line bg-white p-1 shadow-card">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors sm:px-4",
                  filter === f.id ? "bg-navy text-paper" : "text-navy-600 hover:text-navy",
                )}
              >
                {f.label}
                <span className={cn("text-xs tabular-nums", filter === f.id ? "text-paper/70" : "text-muted")}>{counts[f.id]}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-8">
            {grouped.length === 0 ? (
              <EmptyFilter filter={filter} />
            ) : (
              grouped.map((g) => {
                const Icon = CATEGORY_ICONS[g.id];
                return (
                  <section key={g.id} aria-labelledby={`cat-${g.id}`}>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <h3 id={`cat-${g.id}`} className="flex items-center gap-2 text-[15px] font-bold text-navy">
                        <Icon className="size-4 text-navy-600" aria-hidden />
                        {g.label}
                      </h3>
                      <div className="flex w-32 items-center gap-2.5">
                        <Progress value={g.done} max={Math.max(1, g.total)} size="sm" label={`${g.label} progress`} />
                        <span className="text-xs font-semibold text-muted tabular-nums">
                          {g.done}/{g.total}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {g.tasks.map((t) => (
                        <TaskItem key={t.id} task={t} status={status[t.id]} />
                      ))}
                    </ul>
                  </section>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  onClick,
  icon: Icon,
  label,
  shortLabel,
  done,
  total,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortLabel?: string;
  done: number;
  total: number;
}) {
  const complete = total > 0 && done === total;
  return (
    <li className="shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-xl border px-3 text-left text-sm font-medium whitespace-nowrap transition-colors lg:h-auto lg:border-transparent lg:py-2.5",
          active ? "border-navy bg-navy text-paper lg:border-navy" : "border-line bg-white text-navy-600 hover:text-navy lg:bg-transparent lg:hover:bg-white",
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "text-gold" : "text-muted")} />
        <span className="flex-1 lg:hidden">{shortLabel ?? label}</span>
        <span className="hidden flex-1 lg:inline lg:whitespace-normal">{label}</span>
        {complete ? (
          <CircleCheck className={cn("size-4 shrink-0", active ? "text-[#9fd0b4]" : "text-forest")} aria-label="complete" />
        ) : (
          <span className={cn("text-xs tabular-nums", active ? "text-paper/70" : "text-muted")}>
            {done}/{total}
          </span>
        )}
      </button>
    </li>
  );
}

function EmptyFilter({ filter }: { filter: Filter }) {
  const copy =
    filter === "done"
      ? { title: "No completed tasks here yet", body: "Check off tasks as you finish them and they'll appear here." }
      : filter === "todo"
        ? { title: "Nothing left to do here", body: "Every task in this view is complete or marked not applicable." }
        : { title: "No tasks in this category", body: "Try another category." };
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-white/60 px-6 py-14 text-center">
      <CircleCheck className="size-7 text-muted" aria-hidden />
      <p className="mt-3 font-semibold text-navy">{copy.title}</p>
      <p className="mt-1 text-sm text-muted">{copy.body}</p>
    </div>
  );
}
