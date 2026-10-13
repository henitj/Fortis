# FORTIS

**Strength Through Preparation.**

FORTIS builds a personalized emergency plan for your household. You answer five short questions about who lives with you and which emergencies you want to prepare for, and FORTIS gives you back:

- a prioritized action checklist,
- a supply calculator that shows its math,
- a communication plan, and
- a printable plan that you can also save as a PDF.

There's no account, AI service, or backend. Your plan never leaves your browser.

> Built for **WarriorHacks 2.0**.

---

## Why FORTIS

Official preparedness guidance is excellent but generic. One checklist has to cover a single adult in an apartment and a family with a toddler, two dogs, and a relative who uses a home oxygen concentrator. Most people never turn it into a plan.

FORTIS does that translation for you. It doesn't invent guidance. It selects, prioritizes, and explains guidance paraphrased from official sources (Ready.gov / FEMA, the National Weather Service, Government of Canada, and UK Government), based on your household's actual situation.

## Features

| | |
|---|---|
| **Personalized plans** | A rules engine picks from a library of 73 actions, adding each one only when it applies (children, older adults, pets, mobility needs, powered medical equipment, vehicle access, chosen hazards). Each task explains why it's in your plan. |
| **Clear priorities** | Tasks are ranked Critical, High, or Recommended. The overview shows your top three unfinished actions. You can mark tasks *Not applicable*, which removes them from your score. |
| **Smart supply planning** | Water, food, and 25–36 supply items (depending on the household) are calculated from household size and plan length (3, 7, or 14 days). Formulas and assumptions are always visible, and every quantity can be edited. |
| **Communication plan** | Household contacts, an out-of-area contact, primary and alternate meeting places, instructions, and reunification arrangements. |
| **Print / PDF** | A dedicated print layout covering household, contacts, supplies, checklist, safety reminders, and official links. There's also a wallet-size contact card. Empty fields print as lines you can fill in by hand. |
| **Ready offline** | A small, tested service worker caches the app after your first visit, so your plan opens with no connection — during a power or network outage, for example. |
| **Private by design** | Plans are stored in `localStorage` and validated when loaded. You can export and import them as JSON. There's no analytics, telemetry, or cookies. |

### Safety principles built into the content

- FORTIS never suggests delaying an evacuation to gather supplies. Every plan shows: *"If officials tell you to evacuate, leave immediately."*
- The readiness score is labeled **"Preparedness checklist completion"**. It is explicitly not a measure of safety.
- There are no fake alerts, live data, statistics, or testimonials. FORTIS doesn't predict which hazards affect your location.
- Medical topics stay general. FORTIS never asks for diagnoses or medication names. Medication planning is referred to a pharmacist, and powered equipment to the equipment provider and healthcare team.

## How the calculations work

**Water**

```
people         = adults + children        (older adults are already counted as adults)
household water = people × days × 1 gallon
hot weather    = × 2                      (optional; suggested when extreme heat is selected)
pet water      = pets × days × gallons/pet/day   (separate, adjustable, labeled as an estimate)
```

The baseline is Ready.gov's "one gallon of water per person per day for several days, for drinking and sanitation." The app notes that heat, illness, activity, pregnancy, and nursing increase needs.

**Food:** `person-days = people × days`, and `meals = person-days × 3`. This is a planning quantity, not a nutritional guarantee.

**Readiness:** `floor(completed ÷ applicable × 100)`. Tasks marked *Not applicable* are excluded, each task ID is counted once, and status entries for tasks that are no longer in the plan are ignored.

### Rules engine

Each task in `src/lib/data/tasks.ts` is typed data:

```ts
{
  id: "flood-risk",              // stable — progress is keyed by it
  title: "Know your flood risk",
  category: "home-safety",
  priority: "critical",
  hazards: ["flooding", "hurricanes"],   // include if ANY is selected
  requires: [...],                        // include only if ALL household tags apply
  requiresAny: [...],                     // include if ANY household tag applies
  emphasizedFor: [...],                   // raise one priority level for these hazards
  detailOnly: true,                       // omit from concise plans
  reference: "ready-floods",              // verified official link
  minutes: 20,
}
```

`generateTasks(profile)` is pure and deterministic. The same answers always produce the same plan in the same order:

1. priority
2. tasks that address a specific household need
3. hazard-specific tasks
4. library order

If you edit your profile, the plan is regenerated. Completed tasks, supply counts, custom targets, and contacts are kept, and a toast tells you how many tasks were added or removed.

## Tech stack

- Next.js 16 (App Router; every route is statically prerendered), React 19, strict TypeScript
- Tailwind CSS 4, plus small hand-built UI primitives in the shadcn/ui style, with lucide-react icons and the Geist font
- Zod for runtime validation of stored and imported plans
- Vitest unit tests covering the rules engine, supply math, readiness scoring, storage recovery, and content integrity (every task references a real category, hazard, and resource)

There's no database, auth, or API route, and no environment variables are required.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js core-web-vitals and TypeScript rules) |
| `npm test` | Vitest unit tests |
| `npm run check` | All of the above in sequence |

The service worker registers only in production builds. To try offline mode, run `npm run build && npm start`, open the app once, then go offline.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo.
3. Keep the default settings (Framework: Next.js, Build: `next build`). No environment variables are needed.
4. Deploy.

Open Graph URLs use Vercel's built-in `VERCEL_PROJECT_PRODUCTION_URL`, so nothing needs configuring.

## Project structure

```
src/
  app/                 routes: / (landing), /setup (wizard), /plan (dashboard), OG image, 404, error
  components/
    brand/             logo (original shield + home mark)
    landing/           live dashboard preview built from the real engine
    wizard/            5-step setup wizard
    dashboard/         overview, checklist, supplies, contacts, resources tabs
    print/             print-only plan document and contact card
    ui/                buttons, inputs, steppers, dialogs, menus…
  lib/
    data/              tasks, hazards, categories, verified resources, locations
    engine/            rules engine, supply calculator, readiness
    client/            localStorage-backed store (useSyncExternalStore), toasts, print
    schema.ts          Zod schemas + types
    storage.ts         safe parse, recovery, export/import validation
public/sw.js           offline service worker
tests/                 Vitest suites
```

## Storage and data handling

- Key: `fortis:plan:v1`, with a schema version and engine version.
- Corrupted or tampered data never crashes the app. A recovery screen lets you download the raw data or start fresh.
- If storage is unavailable (for example, some private browsing modes), FORTIS keeps working in memory and shows a banner.
- Edits sync across browser tabs.
- Export and import JSON files, which are size-limited and schema-validated. Deleting a plan requires confirmation.

## Sources

All guidance is paraphrased from, and linked to, official sources. Every URL was checked before inclusion.

- Ready.gov (FEMA): [Make a Plan](https://www.ready.gov/plan), [Build a Kit](https://www.ready.gov/kit), [Water](https://www.ready.gov/water), [Food](https://www.ready.gov/food), plus hazard pages for floods, wildfires, heat, winter weather, power outages, earthquakes, hurricanes, and thunderstorms, and pages on [older adults](https://www.ready.gov/older-adults), [people with disabilities](https://www.ready.gov/people-disabilities), [pets](https://www.ready.gov/pets), and [kids](https://www.ready.gov/kids)
- National Weather Service: [Weather Safety](https://www.weather.gov/safety/) and hazard subpages
- FEMA: [Search Your Location](https://www.fema.gov/locations), state pages, and the [Flood Map Service Center](https://msc.fema.gov/portal)
- Government of Canada: [Get Prepared](https://www.canada.ca/en/services/policing/emergencies/preparedness/get-prepared.html)
- UK Government: [Prepare](https://prepare.campaign.gov.uk/) and [Check long-term flood risk](https://www.gov.uk/check-long-term-flood-risk); [Ready Scotland](https://ready.scot/); [nidirect](https://www.nidirect.gov.uk/campaigns/be-ready-emergencies)

Location-specific links are shown only where the mapping is verified: U.S. states link to their FEMA state pages, and Scotland and Northern Ireland to their official sites. Everywhere else, FORTIS shows national guidance and tells you to check your local emergency-management office.

## Limitations

- FORTIS offers general planning guidance only. It is not a substitute for instructions from local officials, emergency services, or medical professionals.
- It provides no live alerts and does not assess the hazard risk of your location.
- Hazard guidance links mostly point to U.S. agencies. The app says so for users outside the U.S.
- Plans live in one browser on one device. Clearing site data erases them, so use export or print as a backup.
- Offline mode starts after the first online visit, and it needs a browser that supports service workers.

## Disclaimer

FORTIS is an independent student project. It is not affiliated with or endorsed by FEMA, the National Weather Service, or any government agency. In a life-threatening emergency, call your local emergency number.
