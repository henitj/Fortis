"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  LockKeyhole,
  MapPin,
  Pencil,
  Printer,
  RotateCcw,
  ShieldCheck,
  Users,
  Waves,
} from "lucide-react";
import { FortisLogo } from "@/components/branding/fortis-logo";
import { Button } from "@/components/ui/button";
import { CommunicationPlanEditor } from "@/components/communication/communication-plan";
import { PriorityActions } from "./priority-actions";
import { ReadinessCard } from "./readiness-card";
import { TaskChecklist } from "./task-checklist";
import { PrintablePlan } from "@/components/print/printable-plan";
import { SupplyCalculator } from "@/components/supplies/supply-calculator";
import { HAZARDS } from "@/lib/preparedness-data";
import {
  DISCLAIMER,
  locationResourceNote,
  OFFICIAL_RESOURCES,
} from "@/lib/official-resources";
import { calculateReadiness } from "@/lib/readiness";
import { getPriorityTasks, getRecommendations } from "@/lib/rules-engine";
import { savePlan } from "@/lib/storage";
import {
  getSupplyMath,
  getSupplyProgress,
  getSupplyRows,
} from "@/lib/supply-calculations";
import type { StoredPlan, TaskStatus } from "@/lib/types";

type SaveState = "saved" | "saving" | "unavailable";

interface Props {
  plan: StoredPlan;
  saveState: SaveState;
  onUpdate: (change: (plan: StoredPlan) => StoredPlan) => void;
  onEdit: () => void;
  onReset: () => void;
}

export function PlanDashboard({
  plan,
  saveState,
  onUpdate,
  onEdit,
  onReset,
}: Props) {
  const [printNotice, setPrintNotice] = useState("");
  const { profile } = plan;
  const tasks = getRecommendations(profile);
  const readiness = calculateReadiness(tasks, plan.taskStates);
  const priority = getPriorityTasks(tasks, plan.taskStates);
  const rows = getSupplyRows(profile, plan.supplies);
  const math = getSupplyMath(profile, plan.supplies.petGallonsPerDay);
  const supplyProgress = getSupplyProgress(rows);
  const hazardLabels = HAZARDS.filter((hazard) =>
    profile.hazards.includes(hazard.id),
  ).map((hazard) => hazard.label);
  const locationLabel = [
    profile.location.locality.trim(),
    profile.location.region.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  function changeTask(id: string, status: TaskStatus) {
    onUpdate((current) => ({
      ...current,
      taskStates: { ...current.taskStates, [id]: status },
    }));
  }

  function printPlan() {
    // Persist synchronously before invoking the browser dialog, even if a state effect is still pending.
    const saved = savePlan(plan);
    if (!saved)
      setPrintNotice(
        "Local saving is unavailable. The current on-screen plan can still be printed; keep a copy.",
      );
    if (typeof window.print !== "function") {
      setPrintNotice(
        "Printing is not available through this button. Use your browser's Print command instead.",
      );
      return;
    }
    try {
      window.print();
    } catch {
      setPrintNotice(
        "The browser couldn't open print. Use your browser's Print command instead.",
      );
    }
  }

  return (
    <>
      <div className="screen-ui min-h-screen bg-paper">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex min-h-[72px] max-w-[1280px] flex-wrap items-center justify-between gap-3 px-[20px] py-3 sm:px-8 lg:px-10">
            <Link href="/" aria-label="FORTIS home" className="rounded-md">
              <FortisLogo />
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden border-l border-line pl-4 text-xs font-bold uppercase tracking-[0.13em] text-slate sm:inline">
                Your plan
              </span>
              <Link
                href="/"
                className="text-xs font-semibold text-slate underline-offset-4 hover:text-ink hover:underline"
              >
                Home
              </Link>
            </div>
          </div>
        </header>
        <nav
          aria-label="Plan sections"
          className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-[1280px] gap-7 overflow-x-auto px-5 sm:px-8 lg:px-10">
            {[
              { id: "overview", label: "Overview" },
              { id: "actions", label: "Actions" },
              { id: "supplies", label: "Supplies" },
              { id: "communication", label: "Communication" },
              { id: "resources", label: "Resources" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex min-h-12 shrink-0 items-center border-b-2 border-transparent text-xs font-bold text-slate transition-colors hover:border-forest hover:text-forest focus-visible:text-forest"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-9 sm:px-8 sm:pt-12 lg:px-10">
          <div id="overview" className="scroll-mt-28">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-[660px]">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.17em] text-forest">
                  <ShieldCheck size={17} /> Your personal readiness workspace
                </p>
                <h1 className="font-display mt-3 text-[clamp(2rem,4vw,3.35rem)] font-extrabold leading-[1.16] tracking-[-0.055em] [overflow-wrap:anywhere]">
                  Your plan for {math.people}{" "}
                  {math.people === 1 ? "person" : "people"}.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate">
                  Welcome to your plan. Here&apos;s a practical path forward for
                  your household—one step at a time.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={onEdit}
                >
                  <Pencil size={16} /> Edit household
                </Button>
                <Button
                  variant="dark"
                  className="w-full sm:w-auto"
                  onClick={printPlan}
                  aria-label="Print / Save as PDF"
                >
                  <Printer size={17} /> Print / Save as PDF
                </Button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-[#d3e1d6] bg-[#eef5ef] px-3 py-1.5 font-bold text-forest">
                <Users size={13} className="mr-1 inline align-[-2px]" />{" "}
                {profile.household.adults} adults · {profile.household.children}{" "}
                children
              </span>
              <span className="rounded-full border border-line bg-white px-3 py-1.5 font-semibold text-slate">
                {profile.household.pets}{" "}
                {profile.household.pets === 1 ? "pet" : "pets"}
              </span>
              <span className="rounded-full border border-line bg-white px-3 py-1.5 font-semibold text-slate">
                {profile.preferences.days}-day plan
              </span>
              {locationLabel && (
                <span className="rounded-full border border-line bg-white px-3 py-1.5 font-semibold text-slate">
                  <MapPin size={12} className="mr-1 inline align-[-2px]" />
                  {locationLabel}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate">
              <span
                aria-live="polite"
                className={`flex items-center gap-1.5 font-semibold ${saveState === "unavailable" ? "text-warning" : "text-forest"}`}
              >
                {saveState === "saved" ? (
                  <>
                    <CheckCircle2 size={14} /> Saved on this device
                  </>
                ) : saveState === "saving" ? (
                  "Saving locally…"
                ) : (
                  "Local storage unavailable — print a backup"
                )}
              </span>
              <span>
                Updated{" "}
                {new Date(plan.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {saveState === "unavailable" && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-[#e8c99f] bg-[#fff7e9] p-4 text-sm leading-6 text-[#754514]"
              >
                Your browser isn&apos;t saving this plan. You can keep working
                in this session, but changes may be lost on refresh. Print a
                copy before leaving.
              </div>
            )}
            {printNotice && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-[#e8c99f] bg-[#fff7e9] p-4 text-sm leading-6 text-[#754514]"
              >
                {printNotice}
              </div>
            )}

            <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <ReadinessCard readiness={readiness} nextTasks={priority} />
              <PriorityActions
                tasks={priority}
                applicable={readiness.applicable}
                profile={profile}
                onStatus={changeTask}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href="#supplies"
                className="group card flex min-h-[100px] min-w-0 flex-wrap items-center gap-3 p-4 transition-colors hover:border-forest/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ec] text-forest">
                  <Waves size={20} />
                </span>
                <span className="min-w-[90px] flex-1 [overflow-wrap:anywhere]">
                  <span className="block font-display text-lg font-extrabold">
                    {math.baselineWaterGallons} gal
                  </span>
                  <span className="block text-xs text-slate">
                    People&apos;s water baseline
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate transition-transform group-hover:translate-x-1"
                />
              </a>
              <a
                href="#supplies"
                className="group card flex min-h-[100px] min-w-0 flex-wrap items-center gap-3 p-4 transition-colors hover:border-forest/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ec] text-forest">
                  <ClipboardList size={20} />
                </span>
                <span className="min-w-[90px] flex-1 [overflow-wrap:anywhere]">
                  <span className="block font-display text-lg font-extrabold">
                    {supplyProgress.needed} items
                  </span>
                  <span className="block text-xs text-slate">
                    Still needed in supplies
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate transition-transform group-hover:translate-x-1"
                />
              </a>
              <a
                href="#communication"
                className="group card flex min-h-[100px] min-w-0 flex-wrap items-center gap-3 p-4 transition-colors hover:border-forest/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf2ec] text-forest">
                  <LockKeyhole size={20} />
                </span>
                <span className="min-w-[90px] flex-1 [overflow-wrap:anywhere]">
                  <span className="block font-display text-base font-extrabold">
                    Stay connected
                  </span>
                  <span className="block text-xs text-slate">
                    Contacts & meeting places
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
            <div className="mt-7 rounded-xl border border-line bg-white px-5 py-4">
              <p className="text-xs font-bold text-ink">
                Planning focus{" "}
                <span className="font-normal text-slate">
                  · chosen by you, not predicted
                </span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {hazardLabels.length ? (
                  hazardLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-md bg-[#eef3ef] px-2.5 py-1 text-[11px] font-semibold text-forest"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate">
                    General preparedness · no hazards selected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-16">
            <TaskChecklist
              tasks={tasks}
              profile={profile}
              states={plan.taskStates}
              onStatus={changeTask}
            />
            <SupplyCalculator
              profile={profile}
              settings={plan.supplies}
              rows={rows}
              onChange={(supplies) =>
                onUpdate((current) => ({ ...current, supplies }))
              }
            />
            <CommunicationPlanEditor
              value={plan.communication}
              onChange={(communication) =>
                onUpdate((current) => ({ ...current, communication }))
              }
            />
            <section
              id="resources"
              className="scroll-mt-28"
              aria-labelledby="resources-title"
            >
              <div className="mb-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-forest">
                  04 / Informed preparation
                </p>
                <h2
                  id="resources-title"
                  className="font-display mt-2 text-2xl font-extrabold tracking-[-0.045em] sm:text-[30px]"
                >
                  Use trusted sources.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate">
                  FORTIS does not issue alerts or tell you when to evacuate. For
                  local instructions, identify your emergency-management agency.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {OFFICIAL_RESOURCES.map((resource) => (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group flex min-h-[145px] flex-col justify-between p-5 transition-colors hover:border-forest/45"
                  >
                    <span className="flex items-center justify-between text-forest">
                      <ShieldCheck size={21} strokeWidth={1.8} />
                      <ExternalLink size={15} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-ink group-hover:text-forest">
                        {resource.name}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate">
                        {resource.description}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-xs leading-6 text-slate">
                {locationResourceNote(profile.location.country)}
              </p>
              <div className="mt-6 rounded-xl border border-[#e3dcca] bg-[#fbf8f0] p-5 text-xs leading-6 text-[#555146]">
                <strong className="text-ink">Important:</strong> {DISCLAIMER}{" "}
                Review and update your plan periodically.
              </div>
            </section>
            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-7">
              <div>
                <p className="text-sm font-bold">
                  Your information stays on this device.
                </p>
                <p className="mt-1 max-w-xl text-xs leading-6 text-slate">
                  No account, database or analytics. Clearing browser data or
                  losing the device can erase this plan. Print and store a copy
                  securely.
                </p>
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={onReset}
                className="text-danger hover:border-danger"
              >
                <RotateCcw size={15} /> Reset plan
              </Button>
            </div>
          </div>
        </main>
        <footer className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-7 text-xs text-slate sm:px-8 lg:px-10">
            <span>FORTIS · Strength Through Preparation.</span>
            <span>Independent planning tool · Not a government service</span>
          </div>
        </footer>
      </div>
      <PrintablePlan
        plan={plan}
        tasks={tasks}
        rows={rows}
        readiness={readiness}
      />
    </>
  );
}
