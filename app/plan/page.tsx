import type { Metadata } from "next";
import { PlanWorkspace } from "@/components/dashboard/plan-workspace";

export const metadata: Metadata = {
  title: "Your household plan",
  description:
    "Build and manage your private FORTIS emergency preparedness plan.",
};

export default function PlanPage() {
  return <PlanWorkspace />;
}
