"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string | number> {
  name: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  "aria-labelledby"?: string;
  className?: string;
  columns?: 2 | 3 | 4;
}

/** Radio group styled as a segmented control — keyboard accessible via native radios. */
export function Segmented<T extends string | number>({
  name,
  value,
  options,
  onChange,
  className,
  columns,
  ...aria
}: SegmentedProps<T>) {
  const cols = columns ?? (options.length as 2 | 3 | 4);
  return (
    <div
      role="radiogroup"
      {...aria}
      className={cn(
        "grid gap-2",
        cols === 2 && "grid-cols-2",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {options.map((opt) => {
        const id = `${name}-${String(opt.value)}`;
        const checked = opt.value === value;
        return (
          <label
            key={String(opt.value)}
            htmlFor={id}
            className={cn(
              "relative flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-all duration-150",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy",
              checked
                ? "border-navy bg-navy text-paper shadow-card"
                : "border-line-strong bg-white text-navy hover:border-navy-600/40",
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={String(opt.value)}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span className="text-sm font-semibold">{opt.label}</span>
            {opt.hint ? (
              <span className={cn("mt-0.5 text-xs", checked ? "text-paper/70" : "text-muted")}>{opt.hint}</span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
