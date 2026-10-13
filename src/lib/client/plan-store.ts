"use client";

import { useSyncExternalStore } from "react";
import type { Communication, Profile, StoredPlan, SupplySettings, TaskStatus } from "@/lib/schema";
import { clearPlan, getBrowserStorage, loadPlan, savePlan, STORAGE_KEY, type StorageLike } from "@/lib/storage";
import { createPlan, regeneratePlan } from "@/lib/plan";
import { ENGINE_VERSION, type RegenerationDiff } from "@/lib/engine/tasks";

export type PlanStatus = "loading" | "empty" | "ready" | "invalid";

export interface SaveInfo {
  state: "idle" | "saved" | "error";
  at: number | null;
  error?: "unavailable" | "quota" | "unknown";
}

export interface PlanStoreState {
  status: PlanStatus;
  plan: StoredPlan | null;
  invalid: { raw: string; reason: string } | null;
  storageAvailable: boolean;
  save: SaveInfo;
  /** Set when a plan was auto-regenerated on load because the rules engine changed. */
  upgradedFrom: string | null;
}

const SERVER_STATE: PlanStoreState = Object.freeze({
  status: "loading",
  plan: null,
  invalid: null,
  storageAvailable: true,
  save: { state: "idle", at: null },
  upgradedFrom: null,
}) as PlanStoreState;

let state: PlanStoreState = SERVER_STATE;
let storage: StorageLike | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function emit(next: PlanStoreState) {
  state = next;
  for (const l of listeners) l();
}

function readFromStorage(): PlanStoreState {
  const result = loadPlan(storage);
  const base = { save: { state: "idle" as const, at: null }, upgradedFrom: null };
  switch (result.status) {
    case "unavailable":
      return { ...base, status: "empty", plan: null, invalid: null, storageAvailable: false };
    case "empty":
      return { ...base, status: "empty", plan: null, invalid: null, storageAvailable: true };
    case "invalid":
      return { ...base, status: "invalid", plan: null, invalid: { raw: result.raw, reason: result.reason }, storageAvailable: true };
    case "ok": {
      let plan = result.plan;
      let upgradedFrom: string | null = null;
      if (plan.engineVersion !== ENGINE_VERSION) {
        upgradedFrom = plan.engineVersion;
        plan = regeneratePlan(plan, plan.profile).plan;
        savePlan(storage, plan);
      }
      return { ...base, upgradedFrom, status: "ready", plan, invalid: null, storageAvailable: true };
    }
  }
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  storage = getBrowserStorage("local");
  state = readFromStorage();
  // Keep multiple open tabs in sync.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) emit(readFromStorage());
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PlanStoreState {
  init();
  return state;
}

function getServerSnapshot(): PlanStoreState {
  return SERVER_STATE;
}

export function usePlanStore(): PlanStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function persist(plan: StoredPlan) {
  const result = savePlan(storage, plan);
  emit({
    ...state,
    status: "ready",
    plan,
    invalid: null,
    save: result.ok ? { state: "saved", at: Date.now() } : { state: "error", at: state.save.at, error: result.reason },
  });
}

function update(updater: (plan: StoredPlan) => StoredPlan) {
  if (!state.plan) return;
  persist({ ...updater(state.plan), updatedAt: new Date().toISOString() });
}

// ───────────── Actions ─────────────

export function createNewPlan(profile: Profile): void {
  persist(createPlan(profile));
}

export function applyProfile(profile: Profile): RegenerationDiff | null {
  if (!state.plan) {
    createNewPlan(profile);
    return null;
  }
  const { plan, diff } = regeneratePlan(state.plan, profile);
  persist(plan);
  return diff;
}

export function setTaskStatus(id: string, status: TaskStatus | null): void {
  update((plan) => {
    const taskStatus = { ...plan.taskStatus };
    if (status === null) delete taskStatus[id];
    else taskStatus[id] = status;
    return { ...plan, taskStatus };
  });
}

export function setSupplyTarget(id: string, value: number | null): void {
  update((plan) => {
    const targets = { ...plan.supplies.targets };
    if (value === null) delete targets[id];
    else targets[id] = value;
    return { ...plan, supplies: { ...plan.supplies, targets } };
  });
}

export function setSupplyOnHand(id: string, value: number): void {
  update((plan) => ({
    ...plan,
    supplies: { ...plan.supplies, onHand: { ...plan.supplies.onHand, [id]: value } },
  }));
}

export function setSupplySettings(patch: Partial<SupplySettings>): void {
  update((plan) => ({
    ...plan,
    supplies: { ...plan.supplies, settings: { ...plan.supplies.settings, ...patch } },
  }));
}

export function updateCommunication(updater: (c: Communication) => Communication): void {
  update((plan) => ({ ...plan, communication: updater(plan.communication) }));
}

export function replacePlan(plan: StoredPlan): void {
  persist(plan);
}

export function resetPlan(): void {
  clearPlan(storage);
  emit({ ...state, status: "empty", plan: null, invalid: null, save: { state: "idle", at: null }, upgradedFrom: null });
}

export function dismissUpgradeNotice(): void {
  if (state.upgradedFrom) emit({ ...state, upgradedFrom: null });
}
