import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABEL, type Priority } from "@/lib/data/categories";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge tone={priority} className={className}>
      {priority === "critical" ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {PRIORITY_LABEL[priority]}
      <span className="sr-only"> priority</span>
    </Badge>
  );
}
