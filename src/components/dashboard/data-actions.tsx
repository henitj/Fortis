"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { replacePlan, resetPlan } from "@/lib/client/plan-store";
import { toast } from "@/lib/client/toast-store";
import { buildExport, exportFileName, MAX_IMPORT_BYTES, parseImport } from "@/lib/storage";
import type { StoredPlan } from "@/lib/schema";

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface DataActions {
  exportPlan: () => void;
  importPlan: () => void;
  requestReset: () => void;
  dialogs: React.ReactNode;
}

/** Export / import / reset with validation and confirmation. */
export function useDataActions(plan: StoredPlan | null): DataActions {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [pendingImport, setPendingImport] = React.useState<StoredPlan | null>(null);

  const exportPlan = () => {
    if (!plan) return;
    downloadJson(buildExport(plan), exportFileName());
    toast({ title: "Plan exported", description: "Keep the file somewhere safe. It contains your contacts.", tone: "success" });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      toast({ title: "Import failed", description: "That file is too large to be a FORTIS plan.", tone: "error" });
      return;
    }
    const result = parseImport(await file.text());
    if (!result.ok) {
      toast({ title: "Import failed", description: result.reason, tone: "error" });
      return;
    }
    if (plan) setPendingImport(result.plan);
    else applyImport(result.plan);
  };

  const applyImport = (next: StoredPlan) => {
    replacePlan(next);
    setPendingImport(null);
    toast({ title: "Plan imported", description: "Your imported plan is now saved in this browser.", tone: "success" });
    router.push("/plan");
  };

  const dialogs = (
    <>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} aria-hidden tabIndex={-1} />
      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        tone="danger"
        title="Delete your saved plan?"
        description="This permanently removes your household profile, checklist progress, supply quantities and contacts from this browser. Consider exporting or printing a copy first."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetPlan();
                setConfirmReset(false);
                toast({ title: "Plan deleted", description: "Your saved data was removed from this browser." });
                router.push("/");
              }}
            >
              Delete plan
            </Button>
          </>
        }
      />
      <Dialog
        open={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        title="Replace your current plan?"
        description="The imported file is valid. Importing will replace the plan currently saved in this browser."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingImport(null)}>
              Cancel
            </Button>
            <Button onClick={() => pendingImport && applyImport(pendingImport)}>Replace plan</Button>
          </>
        }
      />
    </>
  );

  return {
    exportPlan,
    importPlan: () => fileRef.current?.click(),
    requestReset: () => setConfirmReset(true),
    dialogs,
  };
}
