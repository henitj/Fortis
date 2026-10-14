/**
 * Real-browser smoke test. Start the app first (npm run dev or npm run start).
 * Uses packaged headless Chromium. On minimal Linux images, set
 * CHROMIUM_LIB_PATH to directories containing NSS/NSPR shared libraries.
 */
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import chromiumBinary from "@sparticuz/chromium";
import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const extraLibs = process.env.CHROMIUM_LIB_PATH;
const browser = await chromium.launch({
  executablePath: await chromiumBinary.executablePath(),
  args: chromiumBinary.args,
  headless: true,
  env: extraLibs
    ? {
        ...process.env,
        LD_LIBRARY_PATH: [extraLibs, process.env.LD_LIBRARY_PATH]
          .filter(Boolean)
          .join(":"),
      }
    : process.env,
});
const errors = [];

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  assert.match(await page.title(), /FORTIS/);
  assert.equal(
    await page
      .getByRole("heading", {
        name: "Prepared for the unexpected. Ready for what matters.",
      })
      .count(),
    1,
  );
  assert.equal(await page.getByText("Sample preview").count(), 1);
  console.log(
    "✓ Desktop landing route, headline, and live rules-based preview",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
    "Landing has horizontal overflow on mobile",
  );
  await page.locator("details.mobile-menu summary").click();
  assert.equal(
    await page
      .locator("details.mobile-menu")
      .getByRole("link", { name: "Build My Plan" })
      .isVisible(),
    true,
  );
  await page.locator("details.mobile-menu summary").click();
  await page
    .locator("section[aria-labelledby='hero-title']")
    .getByRole("link", { name: "Build My Plan" })
    .click();
  await page
    .getByRole("heading", { name: "Start with where you are." })
    .waitFor();
  console.log("✓ Mobile landing menu, primary CTA and setup route");

  await page.getByLabel("Country").selectOption("US");
  await page.getByLabel(/State or region/).fill("Oregon");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Adults", { exact: true }).fill("2");
  await page.getByLabel("Children", { exact: true }).fill("1");
  await page.getByLabel("Older adults needing additional support").fill("1");
  await page.getByLabel("Pets", { exact: true }).fill("1");
  await page.getByLabel("Mobility or accessibility needs").check();
  await page.getByLabel("Powered medical equipment").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('label[for="hazard-flooding"]').click();
  await page.locator('label[for="hazard-outages"]').click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('label:has(input[name="days"][value="7"])').click();
  await page
    .locator('label:has(input[name="vehicle"])')
    .filter({ hasText: "No" })
    .click();
  await page
    .getByRole("checkbox", { name: /Evacuation assistance may be needed/ })
    .check();
  await page
    .locator('label:has(input[name="detail"])')
    .filter({ hasText: "Detailed" })
    .click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Generate My Plan" }).click();
  await page
    .getByRole("heading", { name: "Your plan for 3 people." })
    .waitFor();
  assert.equal(
    (await page.getByText("21 gal", { exact: true }).count()) > 0,
    true,
    "People water baseline should be 3×7",
  );
  assert.equal(
    (await page.locator(".print-document").textContent()).includes(
      "3 people × 7 days × at least 1 gallon = 21 gal",
    ),
    true,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
    "Dashboard has horizontal overflow on mobile",
  );
  console.log(
    "✓ Wizard, personalized tasks, supply math, and 390px dashboard layout",
  );

  const progress = page.getByRole("progressbar", {
    name: "Preparedness checklist completion",
  });
  assert.equal(await progress.getAttribute("aria-valuenow"), "0");
  await page
    .locator("#overview")
    .getByRole("checkbox", { name: /^Complete / })
    .first()
    .click();
  assert.notEqual(await progress.getAttribute("aria-valuenow"), "0");
  await page
    .getByRole("spinbutton", { name: "Target quantity for Water for people" })
    .fill("35");
  await page
    .getByRole("spinbutton", {
      name: "Available quantity for Water for people",
    })
    .fill("10");
  await page.getByRole("button", { name: "Add contact" }).click();
  await page
    .getByRole("textbox", { name: "Contact 1 name or label" })
    .fill("Household contact");
  await page
    .getByRole("textbox", { name: "Contact 1 phone number" })
    .fill("555-0100");
  await page
    .getByRole("textbox", { name: "Primary meeting place" })
    .fill("Library entrance");
  await page
    .getByRole("textbox", { name: "Reunification arrangements" })
    .fill("Meet at the library. Call the out-of-area contact if separated.");
  await page.getByText("Saved on this device").waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "Your plan for 3 people." })
    .waitFor();
  assert.notEqual(
    await page
      .getByRole("progressbar", { name: "Preparedness checklist completion" })
      .getAttribute("aria-valuenow"),
    "0",
  );
  assert.equal(
    await page
      .getByRole("spinbutton", { name: "Target quantity for Water for people" })
      .inputValue(),
    "35",
  );
  assert.equal(
    await page
      .getByRole("textbox", { name: "Primary meeting place" })
      .inputValue(),
    "Library entrance",
  );
  console.log(
    "✓ Checklist, editable supplies, communication, and localStorage reload",
  );

  await page.context().setOffline(true);
  const beforeOfflineAction = await page
    .getByRole("progressbar", { name: "Preparedness checklist completion" })
    .getAttribute("aria-valuenow");
  await page
    .locator("#actions")
    .getByRole("checkbox", { name: "Mark Set aside household water complete" })
    .click();
  await page
    .getByRole("spinbutton", {
      name: "Available quantity for Shelf-stable meals",
    })
    .fill("63");
  assert.notEqual(
    await page
      .getByRole("progressbar", { name: "Preparedness checklist completion" })
      .getAttribute("aria-valuenow"),
    beforeOfflineAction,
  );
  await page.context().setOffline(false);
  console.log(
    "✓ Loaded checklist and supply calculator stay functional without a network connection",
  );

  await page.evaluate(() => {
    const nativePrint = window.print.bind(window);
    window.print = () => {
      window.__fortisPrintInvoked = true;
      nativePrint();
    };
  });
  await page.getByRole("button", { name: "Print / Save as PDF" }).click();
  assert.equal(
    await page.evaluate(() => window.__fortisPrintInvoked),
    true,
    "Print button did not call browser print API",
  );
  await page.emulateMedia({ media: "print" });
  assert.equal(
    await page
      .locator(".screen-ui")
      .evaluate((el) => getComputedStyle(el).display),
    "none",
  );
  assert.notEqual(
    await page
      .locator(".print-document")
      .evaluate((el) => getComputedStyle(el).display),
    "none",
  );
  const printText = await page.locator(".print-document").textContent();
  for (const text of [
    "35",
    "10",
    "25",
    "Household contact",
    "555-0100",
    "Library entrance",
    "DONE",
    "TO DO · ESSENTIAL",
    "https://www.ready.gov/",
    "https://www.fema.gov/",
  ]) {
    assert.ok(printText.includes(text), `Printable plan missing: ${text}`);
  }
  assert.equal(
    (await page.locator(".print-document table tbody tr").count()) > 0,
    true,
  );
  assert.equal(
    (await page.locator(".print-document .print-task").count()) > 0,
    true,
  );
  const pdf = await page.pdf({
    format: "A4",
    printBackground: false,
    preferCSSPageSize: true,
  });
  assert.ok(pdf.length > 10_000, "PDF output is unexpectedly small");
  await writeFile("/tmp/fortis-browser-smoke.pdf", pdf);
  console.log(
    `✓ Native print API, print media visibility, actual plan data, and ${pdf.length}-byte A4 PDF`,
  );

  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Edit household" }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('label:has(input[name="days"][value="14"])').click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Save & regenerate plan" }).click();
  await page
    .getByRole("heading", { name: "Your plan for 3 people." })
    .waitFor();
  assert.ok(
    (await page.locator(".print-document").textContent()).includes(
      "3 people × 14 days × at least 1 gallon = 42 gal",
    ),
  );
  assert.equal(
    await page
      .getByRole("spinbutton", { name: "Target quantity for Water for people" })
      .inputValue(),
    "35",
    "Custom target should survive regeneration",
  );
  assert.equal(
    await page
      .getByRole("textbox", { name: "Primary meeting place" })
      .inputValue(),
    "Library entrance",
  );
  console.log(
    "✓ Profile edits regenerate calculations while preserving relevant progress and custom data",
  );

  await page.setViewportSize({ width: 768, height: 1024 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
    "Tablet dashboard has horizontal overflow",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
    "Desktop dashboard has horizontal overflow",
  );
  assert.deepEqual(errors, [], "Browser console reported uncaught errors");
  console.log("✓ Tablet and desktop layouts; no uncaught browser errors");

  page.once("dialog", async (dialog) => {
    assert.equal(dialog.type(), "confirm");
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Reset plan" }).click();
  assert.equal(
    await page
      .getByRole("heading", { name: "Your plan for 3 people." })
      .count(),
    1,
  );
  page.once("dialog", async (dialog) => {
    assert.equal(dialog.type(), "confirm");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Reset plan" }).click();
  await page
    .getByRole("heading", { name: "Start with where you are." })
    .waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("fortis:plan:v1")),
    null,
  );
  console.log(
    "✓ Reset asks for confirmation and removes the stored plan only when accepted",
  );
} finally {
  await browser.close();
}
