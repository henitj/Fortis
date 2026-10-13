"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { usePlanStore } from "@/lib/client/plan-store";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface PlanCtaProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  showArrow?: boolean;
  onNavigate?: () => void;
}

/**
 * "Build My Plan" — becomes "Open My Plan" once a plan is saved in this browser.
 * Renders the default label on the server, so there is no hydration mismatch.
 */
export function PlanCta({ className, variant = "primary", size = "md", showArrow = true, onNavigate }: PlanCtaProps) {
  const { status } = usePlanStore();
  const hasPlan = status === "ready";
  return (
    <Link
      href={hasPlan ? "/plan" : "/setup"}
      onClick={onNavigate}
      className={cn(buttonVariants({ variant, size }), "group", className)}
    >
      {hasPlan ? "Open My Plan" : "Build My Plan"}
      {showArrow ? <ArrowRight className="transition-transform duration-150 group-hover:translate-x-0.5" /> : null}
    </Link>
  );
}
