import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  label: string;
  className?: string;
  tone?: "forest" | "navy" | "gold";
  size?: "sm" | "md";
}

export function Progress({ value, max = 100, label, className, tone = "forest", size = "md" }: ProgressProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("w-full overflow-hidden rounded-full bg-navy/[0.07]", size === "sm" ? "h-1.5" : "h-2.5", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "forest" && "bg-forest",
          tone === "navy" && "bg-navy",
          tone === "gold" && "bg-gold",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
