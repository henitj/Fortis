"use client";

import * as React from "react";
import { Ban, Clock, Info, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/plan/priority-badge";
import { setTaskStatus } from "@/lib/client/plan-store";
import { getResource } from "@/lib/data/resources";
import type { GeneratedTask } from "@/lib/engine/tasks";
import type { TaskStatus } from "@/lib/schema";
import { ResourceLink } from "./shared";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: GeneratedTask;
  status: TaskStatus | undefined;
  compact?: boolean;
  showReason?: boolean;
}

export function TaskItem({ task, status, compact, showReason = true }: TaskItemProps) {
  const id = `task-${task.id}`;
  const done = status === "done";
  const na = status === "na";
  const reference = task.reference ? getResource(task.reference) : null;

  return (
    <li
      className={cn(
        "group relative rounded-xl border bg-white transition-[border-color,background-color,opacity] duration-200",
        done ? "border-forest/20 bg-forest-100/40" : na ? "border-dashed border-line-strong bg-paper/60" : "border-line hover:border-line-strong",
        compact ? "p-3.5" : "p-4 sm:p-5",
      )}
    >
      <div className="flex items-start gap-3.5">
        <Checkbox
          id={id}
          size="lg"
          checked={done}
          disabled={na}
          className="mt-px"
          aria-describedby={`${id}-desc`}
          onChange={(e) => setTaskStatus(task.id, e.target.checked ? "done" : null)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <label
              htmlFor={id}
              className={cn(
                "cursor-pointer text-[15px] leading-snug font-semibold transition-colors",
                done ? "text-navy-600 line-through decoration-forest/40" : na ? "text-muted" : "text-navy",
              )}
            >
              {task.title}
            </label>
            <div className="flex items-center gap-2">
              {na ? <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Not applicable</span> : null}
              {!na ? <PriorityBadge priority={task.effectivePriority} /> : null}
            </div>
          </div>
          <p id={`${id}-desc`} className={cn("mt-1.5 text-sm leading-relaxed", done || na ? "text-muted" : "text-navy-600")}>
            {task.description}
          </p>

          {!compact ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {showReason ? (
                <p className="flex items-start gap-1.5 text-[12.5px] leading-relaxed text-muted">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>{task.reason}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", compact ? "mt-2" : "mt-3 border-t border-line/70 pt-3")}>
            {task.minutes ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Clock className="size-3.5" aria-hidden /> ~{task.minutes < 60 ? `${task.minutes} min` : `${Math.round(task.minutes / 60)} hr`}
              </span>
            ) : null}
            {reference ? <ResourceLink resource={reference} /> : null}
            {!compact ? (
              <button
                type="button"
                onClick={() => setTaskStatus(task.id, na ? null : "na")}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-navy/5 hover:text-navy"
              >
                {na ? <RotateCcw className="size-3.5" aria-hidden /> : <Ban className="size-3.5" aria-hidden />}
                {na ? "Restore task" : "Not applicable"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
