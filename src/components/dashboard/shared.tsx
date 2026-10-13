import * as React from "react";
import { ExternalLink } from "lucide-react";
import type { Resource } from "@/lib/data/resources";
import { cn } from "@/lib/utils";

export function ResourceLink({ resource, className, compact }: { resource: Resource; className?: string; compact?: boolean }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-navy underline decoration-navy/20 underline-offset-[3px] transition-colors hover:decoration-navy",
        className,
      )}
    >
      {compact ? resource.title : `${resource.publisher === resource.title ? resource.title : `${resource.publisher}: ${resource.title}`}`}
      <ExternalLink className="size-3 shrink-0 opacity-60 group-hover:opacity-100" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  as: Tag = "h2",
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <Tag className="text-xl font-bold tracking-tight text-navy">{title}</Tag>
        {description ? <div className="mt-1 text-sm leading-relaxed text-muted">{description}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Notice({
  icon: Icon,
  tone = "neutral",
  title,
  children,
  className,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "warn" | "danger" | "success" | "gold";
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 text-[13px] leading-relaxed sm:flex-row sm:items-start",
        tone === "neutral" && "border-line bg-white text-navy-600",
        tone === "warn" && "border-warn/25 bg-warn-100 text-[#6d4210]",
        tone === "danger" && "border-danger/25 bg-danger-100 text-[#7a1810]",
        tone === "success" && "border-forest/20 bg-forest-100 text-forest-600",
        tone === "gold" && "border-gold/40 bg-gold-100 text-[#5c410f]",
        className,
      )}
    >
      <div className="flex flex-1 gap-3">
        <Icon className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={title ? "mt-0.5" : undefined}>{children}</div>
        </div>
      </div>
      {action ? <div className="shrink-0 sm:ml-2">{action}</div> : null}
    </div>
  );
}
