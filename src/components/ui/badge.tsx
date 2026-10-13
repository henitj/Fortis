import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-navy/[0.06] text-navy-600",
        critical: "bg-danger-100 text-danger",
        high: "bg-warn-100 text-warn",
        recommended: "bg-navy/[0.06] text-muted",
        success: "bg-forest-100 text-forest",
        gold: "bg-gold-100 text-[#7a5615]",
        dark: "bg-white/10 text-paper",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
