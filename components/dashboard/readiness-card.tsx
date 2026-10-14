import { ArrowUpRight, CheckCircle2, CircleDashed } from "lucide-react";
import type { PreparednessTask } from "@/lib/types";
import type { Readiness } from "@/lib/readiness";

export function ReadinessCard({
  readiness,
  nextTasks,
}: {
  readiness: Readiness;
  nextTasks: PreparednessTask[];
}) {
  const circumference = 2 * Math.PI * 47;
  return (
    <section
      className="relative overflow-hidden rounded-[22px] bg-ink p-6 text-white sm:p-8"
      aria-labelledby="readiness-title"
    >
      <div
        className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#aebebb]">
          <CircleDashed size={16} className="text-gold" /> Readiness overview
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2
              id="readiness-title"
              className="font-display max-w-[275px] text-2xl font-extrabold leading-[1.2] tracking-[-0.04em]"
            >
              Preparedness checklist completion
            </h2>
            <p className="mt-3 max-w-[290px] text-xs leading-5 text-[#b5c4c4]">
              Your progress through relevant tasks, not a measure or guarantee
              of safety.
            </p>
          </div>
          <div
            className="relative h-[132px] w-[132px] shrink-0"
            role="progressbar"
            aria-label="Preparedness checklist completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={readiness.percentage}
          >
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="47"
                fill="none"
                stroke="#3b4a52"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="47"
                fill="none"
                stroke="#d9a441"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={
                  circumference * (1 - readiness.percentage / 100)
                }
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-[35px] font-extrabold tracking-[-0.06em]">
              {readiness.percentage}
              <span className="ml-0.5 mt-2 text-base font-bold text-gold">
                %
              </span>
            </span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5">
          <div>
            <span className="font-display text-2xl font-extrabold">
              {readiness.completed}
              <span className="text-sm font-medium text-[#aebebb]">
                {" "}
                / {readiness.applicable}
              </span>
            </span>
            <span className="mt-1 block text-xs text-[#bac7c8]">
              Tasks completed
            </span>
          </div>
          <div>
            <span className="font-display text-2xl font-extrabold">
              {readiness.remaining}
            </span>
            <span className="mt-1 block text-xs text-[#bac7c8]">
              Still to do
            </span>
          </div>
        </div>
        <div className="mt-5 border-t border-white/15 pt-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-gold">
            Top unfinished priorities
          </span>
          {nextTasks.length ? (
            <ol className="mt-2 space-y-1.5 text-xs leading-5 text-white/85">
              {nextTasks.map((task, index) => (
                <li key={task.id} className="flex gap-2">
                  <span className="text-[#91a5a3]">0{index + 1}.</span>
                  {task.title}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 flex items-center gap-2 text-xs text-white/85">
              <CheckCircle2 size={16} className="text-gold" /> No unfinished
              applicable tasks. Review your plan regularly.
            </p>
          )}
        </div>
        <a
          href="#actions"
          className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-gold underline underline-offset-4 hover:text-white"
        >
          See all actions <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
