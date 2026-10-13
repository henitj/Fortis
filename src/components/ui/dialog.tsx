"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "default" | "danger";
}

/**
 * Modal built on the native <dialog> element: focus trapping, Escape to close
 * and inert background come from the browser.
 */
export function Dialog({ open, onClose, title, description, children, footer, tone = "default" }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-white p-0 text-navy shadow-raised backdrop:bg-navy/50 backdrop:backdrop-blur-[2px] open:animate-rise print:hidden",
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className={cn("text-lg font-semibold tracking-tight", tone === "danger" && "text-danger")}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-2 rounded-lg p-1.5 text-muted transition-colors hover:bg-navy/5 hover:text-navy"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        {description ? (
          <div id={descId} className="mt-2 text-sm leading-relaxed text-muted">
            {description}
          </div>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
      {footer ? <div className="flex flex-col-reverse gap-2 border-t border-line bg-paper/60 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div> : null}
    </dialog>
  );
}
