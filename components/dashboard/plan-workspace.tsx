"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { FortisLogo } from "@/components/branding/fortis-logo";
import { Button, buttonStyles } from "@/components/ui/button";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { getRecommendations } from "@/lib/rules-engine";
import { createPlan, loadPlan, resetPlan, savePlan } from "@/lib/storage";
import type { HouseholdProfile, StoredPlan } from "@/lib/types";
import { PlanDashboard } from "./plan-dashboard";

type LoadStatus = "loading" | "empty" | "loaded" | "invalid" | "unavailable";
type SaveStatus = "saved" | "saving" | "unavailable";

export function PlanWorkspace() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [plan, setPlan] = useState<StoredPlan | null>(null);
  const [editing, setEditing] = useState(false);
  const [invalidReason, setInvalidReason] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saving");
  const storageBlockedAtLoad = useRef(false);

  useEffect(() => {
    // Read external browser storage after hydration, never during server rendering.
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const result = loadPlan();
      setStatus(result.status);
      if (result.status === "loaded") {
        setPlan(result.plan);
        setSaveStatus("saved");
      }
      if (result.status === "invalid") setInvalidReason(result.reason);
      if (result.status === "unavailable") {
        storageBlockedAtLoad.current = true;
        setSaveStatus("unavailable");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!plan || status !== "loaded") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setSaveStatus(savePlan(plan) ? "saved" : "unavailable");
    });
    return () => {
      cancelled = true;
    };
  }, [plan, status]);

  function updatePlan(change: (current: StoredPlan) => StoredPlan) {
    setSaveStatus("saving");
    setPlan((current) =>
      current
        ? { ...change(current), updatedAt: new Date().toISOString() }
        : current,
    );
  }

  function generate(profile: HouseholdProfile) {
    if (plan) {
      const applicable = new Set(
        getRecommendations(profile).map((task) => task.id),
      );
      const taskStates = Object.fromEntries(
        Object.entries(plan.taskStates).filter(([id]) => applicable.has(id)),
      );
      setPlan({
        ...plan,
        profile,
        taskStates,
        updatedAt: new Date().toISOString(),
      });
    } else {
      setPlan(createPlan(profile));
    }
    setEditing(false);
    setStatus("loaded");
    setSaveStatus("saving");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function clear() {
    if (
      !window.confirm(
        "Permanently remove this saved FORTIS plan, including progress and contacts, from this browser? This cannot be undone. Print a copy first if you need one.",
      )
    )
      return;
    const removed = resetPlan();
    if (!removed && !storageBlockedAtLoad.current) {
      window.alert(
        "Browser storage could not be cleared. Check your browser settings and try again.",
      );
      return;
    }
    // If storage was unavailable from the start, there is only an in-memory plan to clear.
    setPlan(null);
    setEditing(false);
    setStatus(removed ? "empty" : "unavailable");
    setSaveStatus(removed ? "saving" : "unavailable");
    setInvalidReason("");
  }

  if (status === "loading")
    return (
      <div className="screen-ui min-h-screen bg-paper">
        <header className="border-b border-line bg-white px-5 py-4">
          <div className="mx-auto max-w-[1180px]">
            <FortisLogo />
          </div>
        </header>
        <main
          className="mx-auto max-w-[1180px] px-5 py-20"
          role="status"
          aria-live="polite"
        >
          <div className="h-3 w-28 rounded bg-[#d7dfda]" />
          <div className="mt-5 h-9 w-72 max-w-full rounded bg-[#e1e5e1]" />
          <p className="mt-6 text-sm text-slate">
            Opening your plan in this browser…
          </p>
        </main>
      </div>
    );
  if (status === "invalid")
    return (
      <div className="screen-ui min-h-screen bg-paper">
        <header className="border-b border-line bg-white px-5 py-4">
          <div className="mx-auto max-w-[900px]">
            <Link href="/" aria-label="FORTIS home">
              <FortisLogo />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[900px] px-5 py-20">
          <div className="card max-w-xl p-7 sm:p-10">
            <AlertCircle size={32} className="text-warning" />
            <h1 className="font-display mt-5 text-2xl font-extrabold tracking-[-0.04em]">
              We couldn&apos;t open your saved plan.
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate">
              {invalidReason} FORTIS won&apos;t use unreadable data. You can
              clear it and make a new plan, or leave it untouched.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="dark" onClick={clear}>
                <RotateCcw size={16} /> Clear & start fresh
              </Button>
              <Link href="/" className={buttonStyles("outline")}>
                <ArrowLeft size={16} /> Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  if (status === "loaded" && plan && !editing)
    return (
      <PlanDashboard
        plan={plan}
        saveState={saveStatus}
        onUpdate={updatePlan}
        onEdit={() => setEditing(true)}
        onReset={clear}
      />
    );
  return (
    <SetupWizard
      initialProfile={editing && plan ? plan.profile : undefined}
      onGenerate={generate}
      onCancel={
        editing
          ? () => {
              if (
                window.confirm(
                  "Discard unsaved profile edits and return to your plan?",
                )
              )
                setEditing(false);
            }
          : undefined
      }
      storageUnavailable={
        status === "unavailable" || saveStatus === "unavailable"
      }
    />
  );
}
