"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: "md" | "lg";
}

/** Native checkbox (fully accessible) with a custom visual. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size = "md", ...props }, ref) => (
    <span className={cn("relative inline-flex shrink-0", size === "lg" ? "size-6" : "size-5", className)}>
      <input
        ref={ref}
        type="checkbox"
        className="peer absolute inset-0 z-10 m-0 cursor-pointer appearance-none rounded-md opacity-0 disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none flex size-full items-center justify-center rounded-md border-[1.5px] border-line-strong bg-white text-white transition-all duration-150",
          "peer-checked:border-forest peer-checked:bg-forest peer-hover:border-navy-600/60 peer-checked:peer-hover:border-forest-600 peer-checked:peer-hover:bg-forest-600",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy",
          "[&>svg]:scale-50 [&>svg]:opacity-0 peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
        )}
      >
        <Check className={cn("transition-all duration-150", size === "lg" ? "size-4" : "size-3.5")} strokeWidth={3} />
      </span>
    </span>
  ),
);
Checkbox.displayName = "Checkbox";
