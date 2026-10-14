# FORTIS

**Strength Through Preparation.**

FORTIS is a local-first emergency-preparedness planner for households. It turns broad guidance into a tailored action checklist, understandable supply targets, a private communication plan, and a printable document. Built for **WarriorHacks 2.0** around a community-scale problem: people need a calm, practical way to prepare before an emergency, without searching through dozens of disconnected checklists.

## Who it is for

Households planning for people, pets, accessibility needs, and different hazards. FORTIS is a starting point for preparation—not a live alert system, a property-level risk assessment, or an official government service.

## What you can do

- Complete a five-step wizard with optional location, household counts and support considerations, hazard selections, and a 3-, 7-, or 14-day planning horizon. Try the clearly labeled example household for a quick demo; it starts with **no tasks completed**.
- Get relevant, deduplicated tasks with priorities and a visible reason for inclusion. Filter by category and completion state; mark tasks done or not applicable.
- Track **preparedness checklist completion** as completed applicable tasks / all applicable tasks. This is progress through a list, **not a safety score or prediction**.
- Calculate water, meal occasions, pet-water estimates, and other supplies. Change individual targets, enter quantities on hand, mark items covered, and view remaining amounts and category progress.
- Record contacts, an out-of-area contact, two meeting places, communication instructions, and reunification arrangements without transmitting them.
- Reopen your plan after refresh, edit the profile and regenerate recommendations while preserving relevant progress, or reset it with confirmation.
- Use **Print / Save as PDF** to print the current plan, not a sample. Work with an already-loaded plan without calculation-related network requests.

## Stack and architecture

Next.js 16 App Router · React 19 · strict TypeScript · Tailwind CSS 4 · Lucide icons · Zod runtime validation · localStorage · native browser printing. A small reusable button primitive follows the shadcn-style approach; native controls are used where they are more reliable or accessible. Fonts are bundled from npm, not fetched from Google at runtime. No database, login, API routes, paid services, AI key, or required environment variables.

```text
app/                    Routes, metadata, favicon, base styles and print stylesheet
  page.tsx              Landing page (/)
  plan/page.tsx         Local-first plan workspace (/plan)
components/
  branding/             Original SVG shield and wordmark
  landing/              Landing page and rules-based sample preview
  setup/                Five-step wizard and validated inputs
  dashboard/            Workspace, readiness, priorities, checklist
  supplies/             Editable supply calculator
  communication/        Private contact and meeting-place editor
  print/                Dedicated printable plan
  ui/                   Reusable button styles
lib/
  types.ts              Stable domain types and IDs
  preparedness-data.ts  Version-controlled task catalog and hazard labels
  rules-engine.ts       Relevance, deduplication and explanations
  supply-calculations.ts Water, food, pet estimates, inventory progress
  readiness.ts          Completion calculation
  validation.ts         Wizard and stored-data validation
  storage.ts            Versioned persistence and recovery
  official-resources.ts General verified government entry points and disclaimer
tests/                  Unit and interaction tests (Vitest + Testing Library)
scripts/browser-smoke.mjs Real Chromium flow, offline-in-page and PDF checks
scripts/responsive-audit.mjs Chromium viewport, text reflow and axe checks
```

### Personalization, without black-box AI

Each catalog task has a stable ID, category, priority, hazard tags, household tags, and optionally a time estimate and official reference. Empty tags mean a core task. A hazard-tagged task needs **any** matching selected hazard; a household-tagged task needs **any** matching household attribute. If both tag groups are present, both must match. IDs are deduplicated. The dashboard states why each task appears. Editing the profile recomputes applicability; only completion states for still-relevant tasks are kept. This is deterministic local code and static content, not an AI-generated answer or a live hazard inference.

### Supply and readiness assumptions

- **People = adults + children.** Older adults who may need assistance are already counted within adults, never added again.
- **People's water baseline = people × selected days × at least 1 gallon per person per day**, for drinking and basic use. Heat, illness, activity, pregnancy, and other circumstances can increase this starting quantity.
- **Person-days = people × days; meal-planning occasions = person-days × 3.** This count does not establish nutritional adequacy.
- **Pet water = pets × days × configurable gallons per pet per day** (initial illustrative estimate: 0.5 gal). Pets are not people; species, size, weather, and health can change needs substantially.
- Each supply row shows its default baseline, editable target, amount on hand, and **max(0, target − on hand)**. Supply progress counts covered **items**, never a nonsensical sum of gallons, kits, and meals. Custom targets stay customized when profile inputs change; use **Reset** on an item to resume automatic baselines. A human-water target below baseline is flagged.
- **Checklist completion = completed applicable IDs / unique applicable IDs**, rounded to a whole percent. Tasks marked not applicable are excluded. If there are zero applicable tasks, completion is 0%, not a misleading 100%.

Medication and powered-equipment reminders ask users to consult a pharmacist or healthcare professional, and the equipment provider and healthcare team, respectively. FORTIS never prescribes medication quantities or assumes a consumer power bank can operate medical equipment. Never delay an official evacuation to gather supplies.

## Privacy and safety

The saved plan uses the versioned key `fortis:plan:v1` in **this browser's localStorage**. Zod validates stored data at runtime; malformed or unsupported plans open a recovery screen instead of crashing. A blocked or full storage area shows an unsaved-state warning, but the in-memory plan can still be used and printed. No personal details are sent to a server, analytics service, or URL. Site-data clearing, private browsing, another device/browser, or loss of the device can remove the plan. Print a copy, then store it securely. Browser localStorage is not encrypted storage.

Location is optional, displayed only if entered, and is **not** used to infer weather, risk, shelters, or orders. Links are general U.S. government entry points: [Ready.gov](https://www.ready.gov/), [National Weather Service safety](https://www.weather.gov/safety/), and [FEMA](https://www.fema.gov/). Outside the U.S., use the appropriate local emergency-management agency for jurisdiction-specific guidance. Review and update the plan periodically.

> FORTIS provides general emergency-preparedness planning tools. It does not provide live emergency alerts, predict disasters, or replace instructions from local authorities. During an emergency, follow current official guidance and contact emergency services when needed.

A database and a paid AI API are unnecessary for this MVP: small, inspectable rules and calculations can run entirely in the browser, while a single household's private progress can be stored locally. This reduces setup, cost, network dependency, and exposure of contact details.

## Run locally

Use Node.js **22.17+** and npm 10+ (Node 22 is also compatible with the optional packaged Chromium browser test).

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), or go straight to `/plan`. For a production-mode local check:

```bash
npm run build
npm run start
```

### Quality checks

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

`npm run test` runs unit tests for supply calculations, recommendations, scoring, and storage, plus wizard/dashboard/print interactions. To run the **real Chromium** smoke and responsive/accessibility tests, first start the app (`npm run dev` or `npm run start`) on port 3000, then in another terminal:

```bash
npm run test:browser
npm run test:responsive
```

The browser smoke test covers mobile/desktop routes, the wizard, profile regeneration, persistence after reload, loaded-page actions while offline, reset confirmation, the native print API, print-media visibility, and generation of an A4 PDF at `/tmp/fortis-browser-smoke.pdf`. The responsive audit exercises the landing page, all five wizard steps, the dashboard and populated contact editor at **280–1920px** in Chromium; it checks text/control clipping (including within `overflow: hidden`), 150%/200% text-only scaling at 320px, mobile-menu hit targets, and automated axe-core WCAG 2.x/best-practice checks. Intentional scrolling navigation and the illustrative preview are excluded from text clipping checks. Automated checks cannot prove identical rendering on every browser engine or device. If the server is on another port, set `BASE_URL` for **the test commands only**. On minimal Linux containers without NSS/NSPR system libraries, the packaged Chromium binary requires those OS libraries; an optional `CHROMIUM_LIB_PATH` can point to directories containing them. **Neither setting is needed by the application or Vercel.** Print dialogs themselves are browser UI; headless Chromium verifies the native API call and the resulting PDF layout rather than displaying a graphical dialog.

## Print / Save as PDF

1. Open a generated plan at `/plan`. Make any desired checklist, inventory, or contact changes; they save locally as you go.
2. Select **Print / Save as PDF**. FORTIS saves the current state synchronously, then calls the browser's native `window.print()`.
3. Choose a printer or **Save as PDF** in the browser's print dialog. Keep copies with contact information in a safe place.

The print-only document includes FORTIS branding and dates; household, optional location and hazards; completion and caveat; human and pet water formulas; person-days and meal planning; _every_ applicable supply with baseline, target, on-hand and needed quantities; all relevant tasks grouped by category with written completion/priority statuses; any contact and meeting details actually entered; safety reminders, official URLs used in the plan, and the full disclaimer. Blank optional contact sections are omitted. Screen navigation and controls are hidden. Black text, repeated table headings, non-color status labels, wrapping, and avoid-break rules are provided for print.

Browser print pagination, built-in headers/footers, paper sizing, and PDF save controls vary by browser and device. If the button is blocked or unavailable, use the browser's Print command. A real headless Chromium A4 output was exercised in the browser smoke test; users should still review their own print preview before relying on a physical copy.

## Deploy to Vercel

1. Push this repository to GitHub (or another Git provider supported by Vercel).
2. In Vercel, select **Add New → Project**, import the repository, and use the repository root (`.`).
3. Keep **Framework Preset: Next.js** and **Output Directory: automatic**. Use Node.js 22, install command `npm ci`, and build command `npm run build` (the Next.js defaults also work).
4. Add **no environment variables** and no database integration. Click **Deploy**.
5. Visit `/` and `/plan` on the deployed origin. Generate a plan, refresh to confirm origin-scoped localStorage, and use **Print / Save as PDF** from the deployed page.

No deployment is implied by these instructions; deployment must be performed in a Vercel account. Browser storage is scoped to the deployed origin, so plans saved under localhost or another domain do not transfer automatically.

## Known limitations

- There is **no service worker or full PWA cache**. Once loaded, plan interactions and calculations do not need a network; reopening the site or refreshing completely offline is not guaranteed. A printed copy is the dependable offline fallback.
- Plans are local to one browser/origin and do not sync. There is no JSON import/export in this MVP.
- General U.S. resource links are not a substitute for verified local authorities, current instructions, or individual professional advice. FORTIS has no alerts, map, shelter feed, or live hazard data.
- Simplified supply starting points and a checklist percentage cannot establish personal safety, nutritional sufficiency, or specific medical needs.
- PDF page breaks and browser print controls vary; check preview, especially on mobile.
- Automated responsive checks use Chromium, not a device lab for Safari/Firefox or every browser version. `npm audit --omit=dev` reports zero advisories; the full audit currently flags five high-severity dependency entries stemming from a `braces` advisory in the development-only Next.js ESLint plugin → `fast-glob` → `micromatch` → `braces` dependency chain. The affected `braces` release has no published patched version in the current major line; revisit upstream updates before using the tooling on untrusted input.
