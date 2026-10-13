"use client";

export type PrintMode = "full" | "card";

/**
 * Open the browser print dialog. `card` prints only the wallet-size contact
 * card; `full` prints the complete plan. Ctrl/Cmd+P always prints the full plan.
 */
export function printPlan(mode: PrintMode = "full"): void {
  const body = document.body;
  const reset = () => {
    delete body.dataset.printMode;
    window.removeEventListener("afterprint", reset);
  };
  if (mode === "card") body.dataset.printMode = "card";
  else delete body.dataset.printMode;
  window.addEventListener("afterprint", reset);
  window.print();
}
