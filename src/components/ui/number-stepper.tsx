"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  size?: "sm" | "md";
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

/** Accessible numeric input with large +/− targets for touch screens. */
export function NumberStepper({
  id,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  size = "md",
  invalid,
  describedBy,
  className,
}: NumberStepperProps) {
  const [text, setText] = React.useState(String(value));
  const [prevValue, setPrevValue] = React.useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(String(value));
  }

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const commit = (raw: string) => {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) {
      setText(String(value));
      return;
    }
    const c = clamp(n);
    setText(String(c));
    if (c !== value) onChange(c);
  };

  const btn = cn(
    "flex shrink-0 items-center justify-center text-navy transition-colors hover:bg-navy/5 disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "w-8" : "w-11",
  );

  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-xl border bg-white shadow-card focus-within:border-navy",
        invalid ? "border-danger" : "border-line-strong",
        size === "sm" ? "h-9" : "h-11",
        className,
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="size-4" />
      </button>
      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        type="number"
        min={min}
        max={max}
        value={text}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(n) && n >= min && n <= max && n !== value) onChange(n);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
        }}
        className={cn(
          "min-w-0 border-x border-line bg-transparent text-center font-semibold tabular-nums text-navy focus:outline-none",
          size === "sm" ? "w-12 text-sm" : "w-14 text-base",
        )}
      />
      <button
        type="button"
        className={btn}
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
