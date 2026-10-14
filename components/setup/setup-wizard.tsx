"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { FortisLogo } from "@/components/branding/fortis-logo";
import { Button } from "@/components/ui/button";
import type { HouseholdProfile } from "@/lib/types";
import {
  draftFromProfile,
  draftToProfile,
  newDraft,
  validateWizardStep,
} from "@/lib/validation";
import type { DraftErrors, ProfileDraft } from "@/lib/validation";
import {
  HazardsStep,
  HouseholdStep,
  LocationStep,
  PreferencesStep,
  ReviewStep,
} from "./setup-steps";

const STEPS = [
  {
    short: "Location",
    title: "Start with where you are.",
    intro:
      "A little context for your plan. Precise location is entirely up to you.",
  },
  {
    short: "Household",
    title: "Who are we planning for?",
    intro: "The people, pets, and practical needs behind the numbers.",
  },
  {
    short: "Hazards",
    title: "What would you like to prepare for?",
    intro: "Choose what is relevant to you—not what an algorithm predicts.",
  },
  {
    short: "Preferences",
    title: "Set your planning horizon.",
    intro: "A few choices that shape your supply targets and next steps.",
  },
  {
    short: "Review",
    title: "Make it yours.",
    intro: "Take a quick look, then turn these details into a practical plan.",
  },
];

interface Props {
  initialProfile?: HouseholdProfile;
  onGenerate: (profile: HouseholdProfile) => void;
  onCancel?: () => void;
  storageUnavailable?: boolean;
}

export function SetupWizard({
  initialProfile,
  onGenerate,
  onCancel,
  storageUnavailable = false,
}: Props) {
  const [draft, setDraft] = useState<ProfileDraft>(() =>
    initialProfile ? draftFromProfile(initialProfile) : newDraft(),
  );
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [exampleLoaded, setExampleLoaded] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  function update<K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function goTo(next: number) {
    setErrors({});
    setStep(next);
  }

  function continueStep() {
    const issues = validateWizardStep(draft, step);
    if (Object.keys(issues).length > 0) {
      setErrors(issues);
      window.setTimeout(() => {
        document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      }, 0);
      return;
    }
    goTo(step + 1);
  }

  function generate() {
    const profile = draftToProfile(draft);
    if (!profile) {
      const firstInvalid =
        [0, 1, 2, 3].find(
          (index) => Object.keys(validateWizardStep(draft, index)).length > 0,
        ) ?? 0;
      setErrors(validateWizardStep(draft, firstInvalid));
      setStep(firstInvalid);
      return;
    }
    onGenerate(profile);
  }

  function loadExample() {
    setDraft({
      ...newDraft(),
      adults: "2",
      children: "1",
      olderAdults: "1",
      pets: "1",
      hazards: ["storms", "outages"],
      days: 7,
      vehicle: true,
    });
    setErrors({});
    setExampleLoaded(true);
  }

  return (
    <div className="screen-ui min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <nav
          className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-8"
          aria-label="Plan navigation"
        >
          <Link href="/" aria-label="FORTIS home">
            <FortisLogo />
          </Link>
          {onCancel ? (
            <Button variant="ghost" size="small" onClick={onCancel}>
              <ArrowLeft size={16} /> Back to plan
            </Button>
          ) : (
            <Link
              href="/"
              className="rounded-md text-sm font-semibold text-slate underline-offset-4 hover:text-ink hover:underline"
            >
              Back to home
            </Link>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        {storageUnavailable && (
          <div
            className="mb-6 rounded-xl border border-[#edcba6] bg-[#fff7e9] p-4 text-sm text-[#784409]"
            role="status"
          >
            Your browser isn&apos;t allowing local storage. You can build and
            print a plan in this session, but it may not survive a refresh.
          </div>
        )}
        <div className="mb-9 flex flex-wrap items-start justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-forest">
              <ShieldCheck size={16} />{" "}
              {initialProfile ? "Update your plan" : "Build your plan"}
            </span>
            <h1 className="font-display mt-3 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">
              Preparedness starts here.
            </h1>
            <p className="mt-2 text-sm text-slate">
              About two minutes. No account. No personal details you don&apos;t
              want to share.
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-[#d7e1d8] bg-[#eef4ef] px-4 py-2 text-xs font-bold text-forest">
            <LockKeyhole size={14} /> Saved only in this browser
          </span>
        </div>
        <div className="mb-7 rounded-2xl border border-line bg-white px-5 py-5 sm:px-7">
          <div className="mb-4 flex items-center justify-between text-xs font-bold">
            <span className="uppercase tracking-[0.14em] text-forest">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-slate">{STEPS[step].short}</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[#e8ebea]"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={step + 1}
            aria-label="Setup progress"
          >
            <div
              className="h-full rounded-full bg-forest transition-[width]"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <ol className="mt-5 hidden grid-cols-5 gap-3 sm:grid">
            {STEPS.map((item, index) => (
              <li
                key={item.short}
                className={`flex items-center gap-2 text-xs font-semibold ${index === step ? "text-forest" : index < step ? "text-ink" : "text-slate"}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${index === step ? "bg-forest text-white" : index < step ? "bg-[#e6efe8] text-forest" : "bg-paper text-slate"}`}
                >
                  {index < step ? <Check size={13} /> : index + 1}
                </span>
                {item.short}
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
          <section
            className="card min-w-0 p-5 sm:p-8 lg:p-10"
            aria-labelledby="step-title"
          >
            <div className="border-b border-line pb-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-forest">
                {STEPS[step].short}
              </p>
              <h2
                id="step-title"
                ref={headingRef}
                tabIndex={-1}
                className="font-display mt-2 text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold leading-tight tracking-[-0.05em] focus:outline-none"
              >
                {STEPS[step].title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate">
                {STEPS[step].intro}
              </p>
            </div>
            {Object.values(errors).some(Boolean) && (
              <p
                className="mt-5 rounded-lg border border-[#f3cac5] bg-[#fff5f3] px-4 py-3 text-sm font-medium text-danger"
                role="alert"
              >
                Please correct the highlighted{" "}
                {Object.values(errors).filter(Boolean).length === 1
                  ? "field"
                  : "fields"}{" "}
                before continuing.
              </p>
            )}
            <div className="py-7">
              {step === 0 && (
                <LocationStep draft={draft} errors={errors} update={update} />
              )}
              {step === 1 && (
                <HouseholdStep draft={draft} errors={errors} update={update} />
              )}
              {step === 2 && (
                <HazardsStep draft={draft} errors={errors} update={update} />
              )}
              {step === 3 && (
                <PreferencesStep
                  draft={draft}
                  errors={errors}
                  update={update}
                />
              )}
              {step === 4 && <ReviewStep draft={draft} onEdit={goTo} />}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              <div>
                {step > 0 ? (
                  <Button variant="ghost" onClick={() => goTo(step - 1)}>
                    <ArrowLeft size={16} /> Back
                  </Button>
                ) : !initialProfile ? (
                  <button
                    type="button"
                    onClick={loadExample}
                    className="rounded-md text-xs font-bold text-forest underline underline-offset-4 hover:text-ink"
                  >
                    Try example household
                  </button>
                ) : (
                  <span />
                )}
              </div>
              <Button onClick={step === 4 ? generate : continueStep}>
                {step === 4
                  ? initialProfile
                    ? "Save & regenerate plan"
                    : "Generate My Plan"
                  : "Continue"}{" "}
                <ArrowRight size={17} />
              </Button>
            </div>
            {exampleLoaded && step === 0 && (
              <p className="mt-4 text-xs font-medium text-forest" role="status">
                Example inputs loaded: 2 adults (including 1 older adult), 1
                child, 1 pet, storms and outages. Edit anything before
                generating.
              </p>
            )}
          </section>
          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="rounded-2xl bg-ink p-6 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-gold">
                <ShieldCheck size={21} />
              </span>
              <h3 className="font-display mt-6 text-lg font-bold">
                Made for real life.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#c3cecf]">
                Your answers shape a checklist, supply targets, and a
                communication plan you can take with you.
              </p>
            </div>
            <p className="px-2 text-xs leading-6 text-slate">
              FORTIS is a planning tool, not an emergency alert service. During
              an emergency, follow current local instructions.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
