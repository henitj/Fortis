import { planExportSchema, storedPlanSchema, type PlanExport, type StoredPlan } from "@/lib/schema";

/** Versioned key — a future schema change gets a new key plus a migration. */
export const STORAGE_KEY = "fortis:plan:v1";
export const DRAFT_KEY = "fortis:draft:v1";

export type LoadResult =
  | { status: "empty" }
  | { status: "ok"; plan: StoredPlan }
  | { status: "invalid"; raw: string; reason: string }
  | { status: "unavailable" };

/** Minimal Storage interface so the logic can be unit-tested without a browser. */
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getBrowserStorage(kind: "local" | "session" = "local"): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    const store = kind === "local" ? window.localStorage : window.sessionStorage;
    const probe = "fortis:probe";
    store.setItem(probe, "1");
    store.removeItem(probe);
    return store;
  } catch {
    // Disabled storage, private-mode quirks, or sandboxed iframes.
    return null;
  }
}

/** Parse and validate a serialized plan. Never throws. */
export function parsePlan(raw: string): { ok: true; plan: StoredPlan } | { ok: false; reason: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "The saved data is not valid JSON." };
  }
  const result = storedPlanSchema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const where = first?.path.length ? ` (at "${first.path.join(".")}")` : "";
    return { ok: false, reason: `The saved plan doesn't match the expected format${where}.` };
  }
  return { ok: true, plan: result.data };
}

export function loadPlan(storage: StorageLike | null): LoadResult {
  if (!storage) return { status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (raw === null || raw === "") return { status: "empty" };
  const parsed = parsePlan(raw);
  return parsed.ok ? { status: "ok", plan: parsed.plan } : { status: "invalid", raw, reason: parsed.reason };
}

export type SaveResult = { ok: true } | { ok: false; reason: "unavailable" | "quota" | "unknown" };

export function savePlan(storage: StorageLike | null, plan: StoredPlan): SaveResult {
  if (!storage) return { ok: false, reason: "unavailable" };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(plan));
    return { ok: true };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    return { ok: false, reason: name === "QuotaExceededError" ? "quota" : "unknown" };
  }
}

export function clearPlan(storage: StorageLike | null): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ───────────── Export / import ─────────────

export const MAX_IMPORT_BYTES = 512 * 1024;

export function buildExport(plan: StoredPlan, now: Date = new Date()): PlanExport {
  return { app: "FORTIS", kind: "plan-export", exportedAt: now.toISOString(), plan };
}

export function exportFileName(now: Date = new Date()): string {
  const d = now.toISOString().slice(0, 10);
  return `fortis-plan-${d}.json`;
}

/** Validate an imported file's text. Accepts a FORTIS export or a bare stored plan. */
export function parseImport(text: string): { ok: true; plan: StoredPlan } | { ok: false; reason: string } {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, reason: "That file is too large to be a FORTIS plan." };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, reason: "That file isn't valid JSON." };
  }
  const asExport = planExportSchema.safeParse(data);
  if (asExport.success) return { ok: true, plan: asExport.data.plan };
  const asPlan = storedPlanSchema.safeParse(data);
  if (asPlan.success) return { ok: true, plan: asPlan.data };
  return { ok: false, reason: "That file isn't a valid FORTIS plan export. Nothing was changed." };
}
