import { CheckCircle2, ExternalLink } from "lucide-react";
import { PRIORITY_LABELS } from "@/lib/preparedness-data";
import { getTaskReason } from "@/lib/rules-engine";
import type {
  HouseholdProfile,
  PreparednessTask,
  TaskStatus,
} from "@/lib/types";

export function PriorityActions({
  tasks,
  applicable,
  profile,
  onStatus,
}: {
  tasks: PreparednessTask[];
  applicable: number;
  profile: HouseholdProfile;
  onStatus: (id: string, status: TaskStatus) => void;
}) {
  return (
    <section
      className="card flex h-full flex-col p-6 sm:p-8"
      aria-labelledby="priority-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-forest">
            Your next moves
          </p>
          <h2
            id="priority-title"
            className="font-display mt-2 text-xl font-extrabold tracking-[-0.035em]"
          >
            Start with these.
          </h2>
        </div>
        <span className="rounded-full bg-[#eaf2eb] px-3 py-1 text-[11px] font-bold text-forest">
          Top {tasks.length}
        </span>
      </div>
      {tasks.length ? (
        <div className="mt-5 divide-y divide-line">
          {tasks.map((task) => (
            <div key={task.id} className="flex gap-3 py-4 first:pt-0">
              <input
                type="checkbox"
                id={`priority-${task.id}`}
                className="mt-1 h-[19px] w-[19px] shrink-0 cursor-pointer rounded"
                aria-label={`Complete ${task.title}`}
                onChange={() => onStatus(task.id, "done")}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={`priority-${task.id}`}
                    className="cursor-pointer text-sm font-bold leading-5 text-ink"
                  >
                    {task.title}
                  </label>
                  <span className="rounded-md bg-[#f3eee2] px-1.5 py-0.5 text-[10px] font-bold text-[#75551c]">
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate">
                  {task.description}
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-forest">
                  {getTaskReason(task, profile)}
                </p>
                {task.officialUrl && (
                  <a
                    href={task.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-forest underline underline-offset-2 hover:text-ink"
                  >
                    Official guidance <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-1 flex-col items-center justify-center rounded-xl bg-[#f1f6f1] p-7 text-center">
          <CheckCircle2 size={28} className="text-forest" />
          <p className="mt-3 text-sm font-bold text-ink">
            {applicable === 0
              ? "No applicable tasks to score."
              : "You’ve checked every applicable task."}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate">
            Keep your information and supplies up to date.
          </p>
        </div>
      )}
      <a
        href="#actions"
        className="mt-auto inline-flex min-h-10 items-center pt-5 text-xs font-bold text-forest underline underline-offset-4 hover:text-ink"
      >
        View complete checklist
      </a>
    </section>
  );
}
