import type { Metadata } from "next";
import { PlanDashboard } from "@/components/dashboard/plan-dashboard";

export const metadata: Metadata = {
  title: "My plan",
  description: "Your personalized FORTIS emergency plan, saved in this browser.",
  robots: { index: false },
};

export default function PlanPage() {
  return <PlanDashboard />;
}
