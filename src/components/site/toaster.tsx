"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { dismissToast, useToasts } from "@/lib/client/toast-store";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToasts();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6 print:hidden"
    >
      {toasts.map((t) => {
        const Icon = t.tone === "error" ? CircleAlert : t.tone === "success" ? CircleCheck : Info;
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-xl border border-white/10 bg-navy px-4 py-3 text-paper shadow-raised"
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0",
                t.tone === "error" ? "text-[#f3a59c]" : t.tone === "success" ? "text-[#8fc7a8]" : "text-gold",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description ? <p className="mt-0.5 text-[13px] leading-relaxed text-paper/70">{t.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="-mr-1 rounded-md p-1 text-paper/60 transition-colors hover:bg-white/10 hover:text-paper"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
