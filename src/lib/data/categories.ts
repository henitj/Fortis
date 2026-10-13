export const TASK_CATEGORIES = [
  { id: "water-food", label: "Water & food", short: "Water & food" },
  { id: "first-aid", label: "First aid & medications", short: "First aid" },
  { id: "communication", label: "Communication", short: "Communication" },
  { id: "documents", label: "Documents", short: "Documents" },
  { id: "power-lighting", label: "Power & lighting", short: "Power" },
  { id: "evacuation", label: "Evacuation", short: "Evacuation" },
  { id: "home-safety", label: "Home safety", short: "Home safety" },
  { id: "children-older-adults", label: "Children & older adults", short: "Family care" },
  { id: "accessibility-medical", label: "Accessibility & medical equipment", short: "Accessibility" },
  { id: "pets", label: "Pets", short: "Pets" },
  { id: "hazard-specific", label: "Hazard-specific preparation", short: "Hazards" },
] as const;

export type TaskCategoryId = (typeof TASK_CATEGORIES)[number]["id"];

export function getCategoryLabel(id: TaskCategoryId): string {
  return TASK_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export const PRIORITIES = ["critical", "high", "recommended"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  recommended: "Recommended",
};

export const PRIORITY_RANK: Record<Priority, number> = { critical: 0, high: 1, recommended: 2 };
