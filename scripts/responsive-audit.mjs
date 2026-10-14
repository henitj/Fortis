/**
 * Reflow and accessibility audit in real Chromium against a running app.
 * Checks actual text and control bounds as well as document scroll width:
 * an overflow-hidden parent can conceal clipped content from scrollWidth.
 * Uses packaged Chromium; on minimal Linux images CHROMIUM_LIB_PATH can
 * point to directories with NSS/NSPR shared libraries.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import chromiumBinary from "@sparticuz/chromium";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const extraLibs = process.env.CHROMIUM_LIB_PATH;
const widths = [
  280, 320, 360, 375, 390, 414, 480, 640, 768, 820, 1024, 1280, 1440, 1920,
];
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

// This runs inside the browser, where DOM geometry and visibility are known.
// Intentional horizontal scrollers, visually hidden labels, and the purely
// illustrative preview are excluded; the actual hero and plan are NOT.
function inspectReflow() {
  const ignored =
    'nav[aria-label="Plan sections"], [aria-label="Checklist status filter"], .sr-only, .truncate, [role="img"], [aria-hidden="true"], .print-document, option, script, style';
  const problems = [];
  const viewportWidth = innerWidth;

  if (document.documentElement.scrollWidth > viewportWidth + 1) {
    problems.push(
      `document is ${document.documentElement.scrollWidth}px wide (viewport ${viewportWidth}px)`,
    );
  }

  function clipped(rect, element) {
    if (rect.left < -2 || rect.right > viewportWidth + 2) return "viewport";
    for (
      let ancestor = element;
      ancestor && ancestor !== document.body;
      ancestor = ancestor.parentElement
    ) {
      if (
        /hidden|clip|auto|scroll/.test(getComputedStyle(ancestor).overflowX)
      ) {
        const bounds = ancestor.getBoundingClientRect();
        if (rect.left < bounds.left - 2 || rect.right > bounds.right + 2) {
          return `clipped by ${ancestor.tagName.toLowerCase()}`;
        }
      }
    }
    return null;
  }

  const textNodes = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
  );
  while (textNodes.nextNode()) {
    const node = textNodes.currentNode;
    const element = node.parentElement;
    if (
      !node.textContent.trim() ||
      !element ||
      element.closest(ignored) ||
      !element.checkVisibility({ checkVisibilityCSS: true })
    ) {
      continue;
    }
    // Responsive sr-only utilities become 1px clipped elements at their
    // breakpoint; their text ranges still report the un-clipped glyph width.
    const elementBounds = element.getBoundingClientRect();
    if (elementBounds.width <= 2 && elementBounds.height <= 2) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      if (rect.width < 2 || rect.height < 2) continue;
      const reason = clipped(rect, element);
      if (reason) {
        problems.push(
          `text "${node.textContent.trim().slice(0, 40)}" ${reason} (${Math.round(rect.left)}–${Math.round(rect.right)}px)`,
        );
        break;
      }
    }
  }

  for (const element of document.querySelectorAll(
    "a, button, input, select, textarea, summary",
  )) {
    if (
      element.closest(ignored) ||
      !element.checkVisibility({ checkVisibilityCSS: true })
    ) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const reason = clipped(rect, element);
    if (reason) {
      problems.push(
        `${element.tagName.toLowerCase()} "${(element.textContent || element.getAttribute("aria-label") || element.id).trim().slice(0, 40)}" ${reason} (${Math.round(rect.left)}–${Math.round(rect.right)}px)`,
      );
    }
  }
  return problems.slice(0, 12);
}

async function assertReflow(page, label, width, fontSize = 16) {
  await page.setViewportSize({ width, height: 820 });
  await page.evaluate((size) => {
    document.documentElement.style.fontSize = `${size}px`;
  }, fontSize);
  const failures = await page.evaluate(inspectReflow);
  assert.deepEqual(
    failures,
    [],
    `${label}, ${width}px viewport, ${Math.round((fontSize / 16) * 100)}% text: ${failures.join("; ")}`,
  );
}

async function auditView(page, label) {
  for (const width of widths) await assertReflow(page, label, width);
  // Text-only enlargement catches min-content and fixed-height bugs that
  // resizing the viewport alone cannot. 320px is the WCAG reflow target.
  for (const size of [24, 32]) await assertReflow(page, label, 320, size);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
  });
  await page.setViewportSize({ width: 320, height: 820 });
  await assertAccessibility(page, label);
  console.log(`✓ ${label}: ${widths.length} viewports, 150%/200% text, axe`);
}

async function assertAccessibility(page, label) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) {
    await page.addScriptTag({ path: axePath });
  }
  const violations = await page.evaluate(async () => {
    const results = await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: [
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
          "best-practice",
        ],
      },
    });
    return results.violations.map((violation) => ({
      id: violation.id,
      targets: violation.nodes.slice(0, 3).map((node) => node.target),
    }));
  });
  assert.deepEqual(violations, [], `${label}: axe violations`);
}

try {
  const page = await browser.newPage({
    viewport: { width: 320, height: 820 },
  });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await auditView(page, "Landing");
  await page.setViewportSize({ width: 1280, height: 820 });
  await assertAccessibility(page, "Landing desktop");

  for (const fontSize of [16, 32]) {
    await assertReflow(page, "Mobile menu", 320, fontSize);
    const menu = page.locator("details.mobile-menu");
    await menu.locator("summary").click();
    for (const link of await menu.locator("a").all()) {
      const uncovered = await link.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        );
        return hit === element || element.contains(hit);
      });
      assert.equal(
        uncovered,
        true,
        `Mobile menu link covered at ${fontSize}px text`,
      );
    }
    await menu.locator("summary").click();
  }
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
  });
  await page.locator("details.mobile-menu summary").click();
  await page
    .locator("details.mobile-menu")
    .getByRole("link", { name: "Build My Plan" })
    .click();
  await page
    .getByRole("heading", { name: "Start with where you are." })
    .waitFor();
  console.log("✓ Mobile navigation remains on top and every link is clickable");

  await auditView(page, "Wizard: location");
  await page.getByRole("button", { name: "Try example household" }).click();
  for (const step of ["household", "hazards", "preferences", "review"]) {
    await page.getByRole("button", { name: "Continue" }).click();
    await auditView(page, `Wizard: ${step}`);
  }
  await page.getByRole("button", { name: "Generate My Plan" }).click();
  await page.getByRole("heading", { name: /Your plan for/ }).waitFor();
  await auditView(page, "Dashboard");
  await page.setViewportSize({ width: 1280, height: 820 });
  await assertAccessibility(page, "Dashboard desktop");

  await page.getByRole("button", { name: "Add contact" }).click();
  await page.getByLabel("Contact 1 name or label").fill("Neighborhood contact");
  await page.getByLabel("Contact 1 phone number").fill("555-0108");
  await page.getByLabel("Primary meeting place").fill("Community center");
  for (const width of widths) {
    await assertReflow(page, "Dashboard with contacts", width);
  }
  await assertReflow(page, "Dashboard with contacts", 320, 32);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
  });
  await assertAccessibility(page, "Dashboard with contacts");
  assert.deepEqual(pageErrors, [], `Uncaught browser errors: ${pageErrors}`);
  console.log("✓ Populated contact editor: 14 viewports, 200% text; no browser errors");
  console.log("Responsive and accessibility audit passed.");
} finally {
  await browser.close();
}
