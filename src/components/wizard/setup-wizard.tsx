"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lock, Sparkles, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { applyProfile, createNewPlan, usePlanStore } from "@/lib/client/plan-store";
import { toast } from "@/lib/client/toast-store";
import { getBrowserStorage, DRAFT_KEY } from "@/lib/storage";
import {
  householdSchema,
  issuesToFieldErrors,
  locationSchema,
  profileSchema,
  type Profile,
  type StoredPlan,
} from "@/lib/schema";
import { DEFAULT_PROFILE } from "@/lib/plan";
import { cn, pluralize } from "@/lib/utils";
import { LocationStep } from "./steps/location-step";
import { HouseholdStep } from "./steps/household-step";
import { HazardsStep } from "./steps/hazards-step";
import { PreferencesStep } from "./steps/preferences-step";
import { ReviewStep } from "./steps/review-step";

export const STEPS = [
  { id: "location", label: "Location", title: "Where is your household?" },
  { id: "household", label: "Household", title: "Who lives in your household?" },
  { id: "hazards", label: "Hazards", title: "Which emergencies do you want to prepare for?" },
  { id: "preferences", label: "Preferences", title: "How would you like to plan?" },
  { id: "review", label: "Review", title: "Review and generate your plan" },
] as const;

export type FieldErrors = Record<string, string>;

export interface StepProps {
  profile: Profile;
  setProfile: (updater: (p: Profile) => Profile) => void;
  errors: FieldErrors;
}

const INITIAL_PROFILE: Profile = {
  ...DEFAULT_PROFILE,
  household: { ...DEFAULT_PROFILE.household, adults: 1 },
};

function readDraft(): Profile | null {
  const session = getBrowserStorage("session");
  try {
    const raw = session?.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = profileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function validateStep(step: number, profile: Profile): FieldErrors {
  switch (STEPS[step]?.id) {
    case "location": {
      const r = locationSchema.safeParse(profile.location);
      return r.success ? {} : prefix("location", issuesToFieldErrors(r.error));
    }
    case "household": {
      const r = householdSchema.safeParse(profile.household);
      return r.success ? {} : prefix("household", issuesToFieldErrors(r.error));
    }
    case "hazards":
      return profile.hazards.length === 0
        ? { hazards: "Choose at least one hazard to prepare for. You can change this any time." }
        : {};
    case "review": {
      const r = profileSchema.safeParse(profile);
      return r.success ? {} : issuesToFieldErrors(r.error);
    }
    default:
      return {};
  }
}

function prefix(p: string, errors: FieldErrors): FieldErrors {
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [`${p}.${k}`, v]));
}

export function SetupWizard() {
  const store = usePlanStore();
  if (store.status === "loading") return <PageSkeleton label="Loading…" />;
  return <WizardInner existingPlan={store.plan} />;
}

function WizardInner({ existingPlan }: { existingPlan: StoredPlan | null }) {
  const router = useRouter();
  const editing = existingPlan !== null;
  const [profile, setProfileState] = React.useState<Profile>(() => existingPlan?.profile ?? readDraft() ?? INITIAL_PROFILE);
  const [step, setStep] = React.useState(0);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const isFirstRender = React.useRef(true);

  const setProfile = React.useCallback((updater: (p: Profile) => Profile) => {
    setProfileState((prev) => {
      const next = updater(prev);
      if (!editing) {
        try {
          getBrowserStorage("session")?.setItem(DRAFT_KEY, JSON.stringify(next));
        } catch {
          /* draft persistence is best-effort */
        }
      }
      return next;
    });
  }, [editing]);

  // Errors are shown only while still invalid, so they disappear as the user fixes them.
  const visibleErrors = React.useMemo(() => {
    if (Object.keys(errors).length === 0) return errors;
    const current = validateStep(step, profile);
    return Object.fromEntries(Object.keys(errors).filter((k) => k in current).map((k) => [k, current[k]!]));
  }, [errors, step, profile]);

  // Move focus to the step heading on navigation (screen readers + keyboard users).
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goTo = (target: number) => {
    // Only allow jumping forward when all intermediate steps are valid.
    for (let s = step; s < target; s++) {
      const e = validateStep(s, profile);
      if (Object.keys(e).length) {
        setStep(s);
        setErrors(e);
        return;
      }
    }
    setErrors({});
    setStep(target);
  };

  const next = () => {
    const e = validateStep(step, profile);
    if (Object.keys(e).length) {
      setErrors(e);
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("[aria-invalid='true'], [data-error-anchor]")?.focus();
      });
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const generate = () => {
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) {
      setErrors(issuesToFieldErrors(parsed.error));
      return;
    }
    setSubmitting(true);
    if (editing) {
      const diff = applyProfile(parsed.data);
      if (diff) {
        const parts = [];
        if (diff.added.length) parts.push(`${pluralize(diff.added.length, "task")} added`);
        if (diff.removed.length) parts.push(`${pluralize(diff.removed.length, "task")} removed`);
        toast({
          title: "Plan updated",
          description: parts.length ? `${parts.join(", ")}. Your progress was kept.` : "Recommendations are unchanged. Your progress was kept.",
          tone: "success",
        });
      }
    } else {
      createNewPlan(parsed.data);
      try {
        getBrowserStorage("session")?.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      toast({ title: "Your plan is ready", description: "It's saved in this browser. Start with your top priorities.", tone: "success" });
    }
    router.push("/plan");
  };

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const stepProps: StepProps = { profile, setProfile, errors: visibleErrors };

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="FORTIS home" className="rounded-lg">
            <Logo />
          </Link>
          <Link
            href={editing ? "/plan" : "/"}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-navy/5 hover:text-navy"
          >
            <X className="size-4" aria-hidden />
            {editing ? "Cancel editing" : "Exit"}
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-5 pt-8 pb-32 sm:px-8 sm:pt-12">
        <Stepper step={step} onSelect={goTo} />

        <div className="mt-8 sm:mt-10">
          <p className="text-sm font-semibold text-gold-600">
            Step {step + 1} of {STEPS.length}
            {editing ? <span className="ml-2 font-medium text-muted">· Editing your plan</span> : null}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-[1.75rem] leading-tight font-bold tracking-tight text-balance text-navy focus:outline-none sm:text-[2.1rem]"
          >
            {current.title}
          </h1>
        </div>

        <div key={current.id} className="mt-8 animate-rise">
          {current.id === "location" && <LocationStep {...stepProps} />}
          {current.id === "household" && <HouseholdStep {...stepProps} />}
          {current.id === "hazards" && <HazardsStep {...stepProps} />}
          {current.id === "preferences" && <PreferencesStep {...stepProps} />}
          {current.id === "review" && <ReviewStep {...stepProps} onEdit={goTo} editing={editing} />}
        </div>

        <p className="mt-10 flex items-center gap-2 text-[13px] text-muted">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          Your answers stay in this browser. Nothing is sent to a server.
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Button variant="ghost" size="lg" onClick={back} disabled={step === 0} className={cn(step === 0 && "invisible")}>
            <ArrowLeft aria-hidden /> Back
          </Button>
          {isLast ? (
            <Button variant="primary" size="lg" onClick={generate} disabled={submitting} className="min-w-44">
              {editing ? <Check aria-hidden /> : <Sparkles aria-hidden />}
              {editing ? "Update My Plan" : "Generate My Plan"}
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={next} className="min-w-36">
              Continue <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step, onSelect }: { step: number; onSelect: (s: number) => void }) {
  return (
    <nav aria-label="Setup progress">
      {/* Compact bar for small screens */}
      <div className="sm:hidden">
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s.id} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", i <= step ? "bg-navy" : "bg-navy/10")} />
          ))}
        </div>
      </div>
      <ol className="hidden items-center sm:flex">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.id} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={i > step}
                aria-current={active ? "step" : undefined}
                className="group flex items-center gap-2.5 rounded-lg py-1 pr-2 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200",
                    done && "bg-forest text-white",
                    active && "bg-navy text-paper ring-4 ring-navy/10",
                    !done && !active && "border border-line-strong bg-white text-muted",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <span className={cn("text-sm font-medium", active ? "text-navy" : done ? "text-navy-600 group-hover:text-navy" : "text-muted")}>
                  {s.label}
                  {done ? <span className="sr-only"> (completed)</span> : null}
                </span>
              </button>
              {i < STEPS.length - 1 ? (
                <span aria-hidden className={cn("mx-2 h-px flex-1 transition-colors duration-300", done ? "bg-forest/50" : "bg-line-strong")} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
