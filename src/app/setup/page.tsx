import type { Metadata } from "next";
import { SetupWizard } from "@/components/wizard/setup-wizard";

export const metadata: Metadata = {
  title: "Build your plan",
  description: "Answer a few questions about your household to generate a personalized emergency preparedness plan.",
};

export default function SetupPage() {
  return <SetupWizard />;
}
