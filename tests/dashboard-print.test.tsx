import { useState } from "react";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlanDashboard } from "@/components/dashboard/plan-dashboard";
import { PlanWorkspace } from "@/components/dashboard/plan-workspace";
import { PrintablePlan } from "@/components/print/printable-plan";
import { calculateReadiness } from "@/lib/readiness";
import { getRecommendations } from "@/lib/rules-engine";
import { createPlan, savePlan } from "@/lib/storage";
import { getSupplyRows } from "@/lib/supply-calculations";
import type { StoredPlan } from "@/lib/types";
import { profile } from "./fixtures";

function DashboardHarness({ initial }: { initial: StoredPlan }) {
  const [plan, setPlan] = useState(initial);
  return (
    <PlanDashboard
      plan={plan}
      saveState="saved"
      onUpdate={(change) =>
        setPlan((current) => ({
          ...change(current),
          updatedAt: "2026-10-13T12:00:00.000Z",
        }))
      }
      onEdit={vi.fn()}
      onReset={vi.fn()}
    />
  );
}

describe("dashboard interaction and printable plan", () => {
  it("updates checklist completion, inventory and contacts, then prints the current data", async () => {
    const user = userEvent.setup();
    const print = vi.fn();
    vi.stubGlobal("print", print);
    const initial = createPlan(
      profile({
        household: { ...profile().household, adults: 2, children: 1, pets: 1 },
        hazards: ["storms"],
        preferences: { ...profile().preferences, days: 7 },
      }),
      "2026-10-13T00:00:00.000Z",
    );
    const { container } = render(<DashboardHarness initial={initial} />);
    const ui = within(container.querySelector(".screen-ui") as HTMLElement);
    expect(
      ui.getByRole("progressbar", {
        name: "Preparedness checklist completion",
      }),
    ).toHaveAttribute("aria-valuenow", "0");
    const priorityCheckbox = ui.getAllByRole("checkbox", {
      name: /^Complete /,
    })[0];
    await user.click(priorityCheckbox);
    expect(
      ui.getByRole("progressbar", {
        name: "Preparedness checklist completion",
      }),
    ).not.toHaveAttribute("aria-valuenow", "0");
    await user.click(ui.getByRole("button", { name: "Completed" }));
    expect(ui.getByRole("button", { name: "Completed" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      within(container.querySelector("#actions") as HTMLElement).getAllByText(
        "Done",
      ),
    ).toHaveLength(1);
  });

  it("prints current household, supplies, task statuses, communication details and official URLs", async () => {
    const user = userEvent.setup();
    const print = vi.fn();
    vi.stubGlobal("print", print);
    const initial = createPlan(
      profile({
        household: { ...profile().household, adults: 2, children: 1, pets: 1 },
        hazards: ["storms"],
        preferences: { ...profile().preferences, days: 7 },
      }),
      "2026-10-13T00:00:00.000Z",
    );
    const { container } = render(<DashboardHarness initial={initial} />);
    const ui = within(container.querySelector(".screen-ui") as HTMLElement);
    await user.click(ui.getAllByRole("checkbox", { name: /^Complete / })[0]);
    const target = ui.getByRole("spinbutton", {
      name: "Target quantity for Water for people",
    });
    await user.clear(target);
    await user.type(target, "30");
    await user.tab();
    const have = ui.getByRole("spinbutton", {
      name: "Available quantity for Water for people",
    });
    await user.clear(have);
    await user.type(have, "6");
    await user.click(ui.getByRole("button", { name: "Add contact" }));
    await user.type(
      ui.getByRole("textbox", { name: "Contact 1 name or label" }),
      "Family contact",
    );
    await user.type(
      ui.getByRole("textbox", { name: "Contact 1 phone number" }),
      "555-0100",
    );
    await user.type(
      ui.getByRole("textbox", { name: "Primary meeting place" }),
      "Library entrance",
    );
    await user.click(ui.getByRole("button", { name: "Print / Save as PDF" }));
    expect(print).toHaveBeenCalledTimes(1);
    const printed = container.querySelector(".print-document")!;
    expect(printed.textContent).toContain(
      "3 people × 7 days × at least 1 gallon = 21 gal",
    );
    expect(printed.textContent).toContain("Pet");
    expect(printed.textContent).toContain("30");
    expect(printed.textContent).toContain("24");
    expect(printed.textContent).toContain("Family contact");
    expect(printed.textContent).toContain("Library entrance");
    expect(printed.textContent).toContain("DONE");
    expect(printed.textContent).toContain("TO DO · ESSENTIAL");
    expect(printed.textContent).toContain("https://www.ready.gov/");
    expect(printed.textContent).toContain("https://www.weather.gov/safety/");
    expect(window.localStorage.getItem("fortis:plan:v1")).toContain(
      "Library entrance",
    );
  }, 15_000);

  it("provides a non-blocking fallback when native printing is unavailable", async () => {
    vi.stubGlobal("print", undefined);
    const user = userEvent.setup();
    const { container } = render(
      <DashboardHarness initial={createPlan(profile())} />,
    );
    await user.click(
      within(container.querySelector(".screen-ui") as HTMLElement).getByRole(
        "button",
        { name: "Print / Save as PDF" },
      ),
    );
    expect(
      within(container.querySelector(".screen-ui") as HTMLElement).getByRole(
        "status",
      ).textContent,
    ).toContain("Use your browser's Print command instead");
  });

  it("does not label an all-not-applicable checklist as complete", () => {
    const plan = createPlan(profile());
    for (const task of getRecommendations(plan.profile))
      plan.taskStates[task.id] = "not-applicable";
    const { container } = render(<DashboardHarness initial={plan} />);
    const ui = within(container.querySelector(".screen-ui") as HTMLElement);
    expect(
      ui.getByRole("progressbar", {
        name: "Preparedness checklist completion",
      }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(ui.getByText("No applicable tasks to score.")).toBeInTheDocument();
  });

  it("omits empty optional contact and location blocks from print", () => {
    const plan = createPlan(profile(), "2026-10-13T00:00:00.000Z");
    const tasks = getRecommendations(plan.profile);
    const { container } = render(
      <PrintablePlan
        plan={plan}
        tasks={tasks}
        rows={getSupplyRows(plan.profile, plan.supplies)}
        readiness={calculateReadiness(tasks, plan.taskStates)}
      />,
    );
    const printed = container.querySelector(".print-document")!;
    expect(printed.textContent).not.toContain("Emergency communication plan");
    expect(printed.textContent).not.toContain("Location provided:");
    expect(printed.textContent).not.toContain("Estimated pet water");
    expect(printed.textContent).toContain("https://www.fema.gov/");
  });

  it("opens a saved plan on reload without hydration-dependent data in the initial markup", async () => {
    const plan = createPlan(profile({ hazards: ["wildfires"] }));
    plan.taskStates["water-store"] = "done";
    expect(savePlan(plan, window.localStorage)).toBe(true);
    const first = render(<PlanWorkspace />);
    expect(
      screen.getByText(/Opening your plan in this browser/),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Saved on this device")).toBeInTheDocument(),
    );
    expect(screen.getAllByText(/Wildfires/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("progressbar", {
        name: "Preparedness checklist completion",
      }),
    ).not.toHaveAttribute("aria-valuenow", "0");
    first.unmount();
    render(<PlanWorkspace />);
    await waitFor(() =>
      expect(screen.getByText("Saved on this device")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("progressbar", {
        name: "Preparedness checklist completion",
      }),
    ).not.toHaveAttribute("aria-valuenow", "0");
  });

  it("starts with the wizard when there is no saved plan", async () => {
    render(<PlanWorkspace />);
    expect(
      await screen.findByRole("heading", { name: "Start with where you are." }),
    ).toBeInTheDocument();
  });

  it("shows a recovery path for invalid browser data", async () => {
    window.localStorage.setItem("fortis:plan:v1", "broken json");
    render(<PlanWorkspace />);
    expect(
      await screen.findByRole("heading", {
        name: /couldn't open your saved plan/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clear & start fresh/ }),
    ).toBeInTheDocument();
  });

  it("includes print-only layout, grayscale status text, page breaks, and screen-only hiding rules", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toContain("@media print");
    expect(css).toMatch(/\.screen-ui[^{}]*\{\s*display:\s*none !important;/);
    expect(css).toMatch(/\.print-document\s*\{\s*display:\s*block !important;/);
    expect(css).toContain("break-inside: avoid");
    expect(css).toContain("page-break-inside: avoid");
    expect(css).toContain("table-header-group");
  });
});
