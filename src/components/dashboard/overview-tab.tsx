"use client";

import * as React from "react";
import {
  ArrowRight,
  Ban,
  CircleCheck,
  Circle,
  Download,
  ExternalLink,
  Droplets,
  HardDrive,
  ListChecks,
  MessageSquare,
  PartyPopper,
  Trash2,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ReadinessRing } from "@/components/plan/readiness-ring";
import { HAZARD_ICONS } from "@/components/plan/icons";
import { readinessStage, STAGE_COPY } from "@/lib/engine/readiness";
import { formatNumber, gallonsToLiters } from "@/lib/engine/supplies";
import { getHazard } from "@/lib/data/hazards";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/data/categories";
import { getResource } from "@/lib/data/resources";
import { cn, pluralize } from "@/lib/utils";
import { TaskItem } from "./task-item";
import type { PlanView } from "./use-plan-view";
import type { TabId } from "./plan-dashboard";
import type { DataActions } from "./data-actions";

export function OverviewTab({
  view,
  onNavigate,
  data,
}: {
  view: PlanView;
  onNavigate: (tab: TabId, opts?: { category?: string }) => void;
  data: DataActions;
}) {
  const { readiness, plan, nextTasks, tasks } = view;
  const stage = readinessStage(readiness);
  const copy = STAGE_COPY[stage];
  const top = nextTasks.slice(0, 3);
  const fromHazards = tasks.filter((t) => t.hazards).length;
  const fromHousehold = tasks.filter((t) => !t.hazards && (t.requires || t.requiresAny)).length;
  const universal = tasks.length - fromHazards - fromHousehold;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Readiness */}
        <Card className="overflow-hidden">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Preparedness checklist completion</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ReadinessRing percentage={readiness.percentage} size={132} />
              <div className="min-w-0">
                <p className="text-lg font-bold tracking-tight text-navy">{copy.title}</p>
                <p className="mt-1 text-[15px] font-semibold text-navy-600 tabular-nums">
                  {readiness.completed} of {readiness.applicable} tasks complete
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{copy.body}</p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-paper/50">
              <Metric label="Completed" value={readiness.completed} tone="text-forest" />
              <Metric label="Remaining" value={readiness.remaining} />
              <Metric label="Not applicable" value={readiness.notApplicable} tone="text-muted" />
            </dl>

            <div className="mt-6 space-y-3">
              {PRIORITIES.map((p) => {
                const inTier = tasks.filter((t) => t.effectivePriority === p && plan.taskStatus[t.id] !== "na");
                if (inTier.length === 0) return null;
                const done = inTier.filter((t) => plan.taskStatus[t.id] === "done").length;
                return (
                  <div key={p}>
                    <div className="mb-1.5 flex justify-between text-[13px]">
                      <span className="font-medium text-navy-600">{PRIORITY_LABEL[p]} tasks</span>
                      <span className="font-semibold text-navy tabular-nums">
                        {done}/{inTier.length}
                      </span>
                    </div>
                    <Progress
                      value={done}
                      max={inTier.length}
                      size="sm"
                      tone={p === "critical" ? "navy" : p === "high" ? "forest" : "gold"}
                      label={`${PRIORITY_LABEL[p]} tasks complete`}
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              This score reflects checklist completion only. It is not a measurement of actual safety and does not predict
              emergency outcomes.
            </p>
          </CardContent>
        </Card>

        {/* Priorities */}
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="size-5 text-gold-600" aria-hidden /> Priority actions
              </CardTitle>
              <CardDescription className="mt-1">
                Your highest-priority unfinished tasks, ranked by importance and relevance to your household.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {top.length > 0 ? (
              <ul className="space-y-3">
                {top.map((t) => (
                  <TaskItem key={t.id} task={t} status={plan.taskStatus[t.id]} compact />
                ))}
              </ul>
            ) : readiness.applicable === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
                <Ban className="size-7 text-muted" aria-hidden />
                <p className="mt-3 font-semibold text-navy">Every task is marked not applicable</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Restore tasks in the checklist, or edit your plan if your household or hazards have changed.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-forest/20 bg-forest-100/50 px-6 py-10 text-center">
                <PartyPopper className="size-7 text-forest" aria-hidden />
                <p className="mt-3 font-semibold text-navy">Every applicable task is complete</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Review your supplies and contacts at least twice a year, and update your plan when your household changes.
                </p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-muted">
                {nextTasks.length > 3 ? `${nextTasks.length - 3} more tasks after these.` : null}
              </p>
              <Button variant="secondary" size="sm" onClick={() => onNavigate("checklist")}>
                View full checklist <ArrowRight aria-hidden />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Supplies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="size-[18px] text-forest" aria-hidden /> Supplies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-navy tabular-nums">
              {formatNumber(view.water.totalGallons)} <span className="text-base font-semibold text-muted">gallons of water</span>
            </p>
            <p className="mt-1 text-[13px] text-muted">
              ≈ {formatNumber(gallonsToLiters(view.water.totalGallons), 1)} L for {view.water.days} days
              {view.water.pets ? " · includes pet estimate" : ""}
            </p>
            <div className="mt-5 flex items-baseline justify-between text-sm">
              <span className="font-medium text-navy-600">Supplies available</span>
              <span className="font-semibold text-navy tabular-nums">
                {view.supplySummary.available} / {view.supplySummary.planned}
              </span>
            </div>
            <Progress className="mt-2" value={view.supplySummary.available} max={Math.max(1, view.supplySummary.planned)} label="Supplies available" tone="navy" />
            <Button variant="ghost" size="sm" className="mt-4 -ml-3" onClick={() => onNavigate("supplies")}>
              Open supply calculator <ArrowRight aria-hidden />
            </Button>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-[18px] text-navy" aria-hidden /> Communication plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              <Check ok={view.communication.contacts > 0}>
                {view.communication.contacts > 0 ? pluralize(view.communication.contacts, "household contact") : "Add household contacts"}
              </Check>
              <Check ok={view.communication.outOfArea}>Out-of-area contact</Check>
              <Check ok={view.communication.meetingPlaces === 2}>
                Meeting places ({view.communication.meetingPlaces} of 2)
              </Check>
            </ul>
            <Button variant="ghost" size="sm" className="mt-4 -ml-3" onClick={() => onNavigate("contacts")}>
              {view.communication.complete ? "Review contacts" : "Complete contacts"} <ArrowRight aria-hidden />
            </Button>
          </CardContent>
        </Card>

        {/* Hazards */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Hazards in your plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {plan.profile.hazards.map((id) => {
                const Icon = HAZARD_ICONS[id];
                const hazard = getHazard(id);
                const count = tasks.filter((t) => t.matchedHazards.includes(id)).length;
                const ref = getResource(hazard.resources[0]!);
                return (
                  <li key={id} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-navy">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-paper">
                        <Icon className="size-4 text-navy-600" aria-hidden />
                      </span>
                      {hazard.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="text-xs whitespace-nowrap text-muted tabular-nums">{pluralize(count, "task")}</span>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-navy"
                        aria-label={`${ref.publisher}: ${ref.title} (opens in a new tab)`}
                        title={`${ref.publisher}: ${ref.title}`}
                      >
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card>
          <CardHeader>
            <CardTitle>How your plan was built</CardTitle>
            <CardDescription>
              FORTIS evaluated {plan.profile.preferences.detailLevel === "detailed" ? "every" : "every essential"} rule in its task
              library against your answers. Nothing is guessed or generated by AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <BuildStat value={universal} label="Core tasks" sub="in every plan" />
              <BuildStat value={fromHazards} label="Hazard tasks" sub="from your selections" />
              <BuildStat value={fromHousehold} label="Household tasks" sub="from your needs" />
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">
              Each task in your checklist explains why it was included. Tasks that apply to several hazards appear once.
              {plan.profile.preferences.detailLevel === "concise"
                ? " You chose a concise plan — switch to detailed in Edit plan to see extra steps."
                : null}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="size-[18px] text-navy" aria-hidden /> Your data stays on this device
            </CardTitle>
            <CardDescription>
              Saved in this browser only. Clearing site data or losing this device will erase it — keep a printed or exported
              copy.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={data.exportPlan}>
              <Download aria-hidden /> Export
            </Button>
            <Button variant="secondary" size="sm" onClick={data.importPlan}>
              <Upload aria-hidden /> Import
            </Button>
            <Button variant="danger-ghost" size="sm" onClick={data.requestReset}>
              <Trash2 aria-hidden /> Delete
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="px-3 py-3 text-center">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd className={cn("mt-0.5 text-xl font-bold tabular-nums text-navy", tone)}>{value}</dd>
    </div>
  );
}

function BuildStat({ value, label, sub }: { value: number; label: string; sub: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper/50 p-3.5">
      <p className="text-2xl font-bold tracking-tight text-navy tabular-nums">{value}</p>
      <p className="text-[13px] font-semibold text-navy-600">{label}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {ok ? <CircleCheck className="size-[18px] text-forest" aria-hidden /> : <Circle className="size-[18px] text-line-strong" aria-hidden />}
      <span className={ok ? "font-medium text-navy" : "text-navy-600"}>{children}</span>
      <span className="sr-only">{ok ? "(done)" : "(not done)"}</span>
    </li>
  );
}
