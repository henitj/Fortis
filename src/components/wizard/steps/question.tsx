import * as React from "react";
import { cn } from "@/lib/utils";

/** A labelled group of form controls with optional explanation of why it's asked. */
export function Question({
  id,
  title,
  hint,
  why,
  optional,
  children,
  className,
  error,
}: {
  id: string;
  title: string;
  hint?: React.ReactNode;
  why?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div role="group" aria-labelledby={`${id}-label`} aria-describedby={hint || why ? `${id}-hint` : undefined} className={cn("py-6 first:pt-0 last:pb-0", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="max-w-md">
          <p id={`${id}-label`} className="text-[15px] font-semibold text-navy">
            {title}
            {optional ? <span className="ml-2 text-xs font-medium text-muted">Optional</span> : null}
          </p>
          {hint || why ? (
            <div id={`${id}-hint`} className="mt-1 space-y-1 text-[13px] leading-relaxed text-muted">
              {hint ? <p>{hint}</p> : null}
              {why ? (
                <p>
                  <span className="font-semibold text-navy-600">Why we ask: </span>
                  {why}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
