import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { profile } from "./fixtures";

describe("household setup wizard", () => {
  it("navigates, preserves input, validates counts and vehicle choice, then generates a real profile", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<SetupWizard onGenerate={onGenerate} />);
    expect(
      screen.getByRole("heading", { name: "Start with where you are." }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText(/State or region/), "Oregon");
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(
      screen.getByRole("heading", { name: "Who are we planning for?" }),
    ).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Adults"));
    await user.type(screen.getByLabelText("Adults"), "0");
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(
      screen.getByText("Adults must be between 1 and 30."),
    ).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Adults"));
    await user.type(screen.getByLabelText("Adults"), "2");
    await user.clear(
      screen.getByLabelText("Older adults needing additional support"),
    );
    await user.type(
      screen.getByLabelText("Older adults needing additional support"),
      "3",
    );
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(
      screen.getByText(/Include older adults in the adult count above/),
    ).toBeInTheDocument();
    await user.clear(
      screen.getByLabelText("Older adults needing additional support"),
    );
    await user.type(
      screen.getByLabelText("Older adults needing additional support"),
      "1",
    );
    await user.clear(screen.getByLabelText("Pets"));
    await user.type(screen.getByLabelText("Pets"), "2");
    await user.click(screen.getByRole("button", { name: /Back$/ }));
    expect(screen.getByLabelText(/State or region/)).toHaveValue("Oregon");
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByLabelText("Adults")).toHaveValue(2);
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.click(screen.getByRole("checkbox", { name: /Flooding/ }));
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(
      screen.getByText("Choose whether a vehicle is available."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "No" }));
    await user.click(screen.getByRole("radio", { name: /7 days/ }));
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByText(/Flooding/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Generate My Plan/ }));
    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        location: expect.objectContaining({ region: "Oregon" }),
        household: expect.objectContaining({
          adults: 2,
          olderAdults: 1,
          pets: 2,
        }),
        hazards: ["flooding"],
        preferences: expect.objectContaining({ days: 7, vehicle: false }),
      }),
    );
  });

  it("loads an explicit example with no fake progress and allows edits in review", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<SetupWizard onGenerate={onGenerate} />);
    await user.click(
      screen.getByRole("button", { name: "Try example household" }),
    );
    expect(screen.getByText(/Example inputs loaded/)).toBeInTheDocument();
    for (let i = 0; i < 4; i++)
      await user.click(screen.getByRole("button", { name: /Continue/ }));
    const review = screen
      .getByRole("heading", { name: "Make it yours." })
      .closest("section")!;
    await user.click(
      within(review).getByRole("button", { name: "Edit Household" }),
    );
    expect(screen.getByLabelText("Children")).toHaveValue(1);
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it("regenerates an edited plan without changing data until confirmed", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(
      <SetupWizard
        initialProfile={profile({ hazards: ["heat"] })}
        onGenerate={onGenerate}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.clear(screen.getByLabelText("Adults"));
    await user.type(screen.getByLabelText("Adults"), "4");
    for (let i = 0; i < 3; i++)
      await user.click(screen.getByRole("button", { name: /Continue/ }));
    await user.click(
      screen.getByRole("button", { name: /Save & regenerate plan/ }),
    );
    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        household: expect.objectContaining({ adults: 4 }),
        hazards: ["heat"],
      }),
    );
  });
});
