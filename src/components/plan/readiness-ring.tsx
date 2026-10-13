import { cn } from "@/lib/utils";

interface ReadinessRingProps {
  percentage: number | null;
  size?: number;
  stroke?: number;
  className?: string;
  tone?: "light" | "dark";
  label?: string;
}

/** Circular progress for checklist completion. Purely presentational. */
export function ReadinessRing({ percentage, size = 136, stroke = 11, className, tone = "light", label }: ReadinessRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = percentage ?? 0;
  const offset = c * (1 - pct / 100);
  const complete = percentage === 100;
  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={tone === "dark" ? "stroke-white/10" : "stroke-navy/[0.07]"} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", complete ? "stroke-forest" : tone === "dark" ? "stroke-gold" : "stroke-forest")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn("font-bold tabular-nums tracking-tight", tone === "dark" ? "text-paper" : "text-navy")}
          style={{ fontSize: size * 0.24 }}
        >
          {percentage === null ? "—" : `${percentage}%`}
        </span>
        {label ? (
          <span className={cn("mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em]", tone === "dark" ? "text-paper/60" : "text-muted")}>
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
