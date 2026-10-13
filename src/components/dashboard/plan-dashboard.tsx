"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  CircleCheck,
  Download,
  Ellipsis,
  FileWarning,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  Pencil,
  Printer,
  RefreshCcw,
  ShieldCheck,
  Siren,
  Trash2,
  Upload,
  BookOpen,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { dismissUpgradeNotice, resetPlan, usePlanStore, type SaveInfo } from "@/lib/client/plan-store";
import { printPlan } from "@/lib/client/print";
import { toast } from "@/lib/client/toast-store";
import { useDataActions } from "./data-actions";
import { usePlanView, type PlanView } from "./use-plan-view";
import { Notice } from "./shared";
import { OverviewTab } from "./overview-tab";
import { ChecklistTab } from "./checklist-tab";
import { SuppliesTab } from "./supplies-tab";
import { ContactsTab } from "./contacts-tab";
import { ResourcesTab } from "./resources-tab";
import { PrintPlan } from "@/components/print/print-plan";
import { describeLocation } from "@/lib/data/locations";
import { cn, pluralize } from "@/lib/utils";
import type { StoredPlan } from "@/lib/schema";

export const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "checklist", label: "Checklist", icon: ListChecks },
  { id: "supplies", label: "Supplies", icon: Package },
  { id: "contacts", label: "Contacts", icon: MessageSquare },
  { id: "resources", label: "Resources", icon: BookOpen },
] as const;
export type TabId = (typeof TABS)[number]["id"];

const isTab = (v: string): v is TabId => TABS.some((t) => t.id === v);

export function PlanDashboard() {
  const store = usePlanStore();

  if (store.status === "loading") return <PageSkeleton />;
  if (store.status === "invalid" && store.invalid) return <InvalidState raw={store.invalid.raw} reason={store.invalid.reason} />;
  if (store.status === "empty" || !store.plan) return <EmptyState storageAvailable={store.storageAvailable} />;
  return (
    <Dashboard
      plan={store.plan}
      save={store.save}
      storageAvailable={store.storageAvailable}
      upgradedFrom={store.upgradedFrom}
    />
  );
}

/* ───────────────────────── Ready ───────────────────────── */

function Dashboard({
  plan,
  save,
  storageAvailable,
  upgradedFrom,
}: {
  plan: StoredPlan;
  save: SaveInfo;
  storageAvailable: boolean;
  upgradedFrom: string | null;
}) {
  const view = usePlanView(plan);
  const data = useDataActions(plan);
  const [tab, setTabState] = React.useState<TabId>(() => {
    const h = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    return isTab(h) ? h : "overview";
  });
  const [checklistFocus, setChecklistFocus] = React.useState<string | null>(null);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const setTab = React.useCallback((next: TabId, opts?: { category?: string }) => {
    setTabState(next);
    setChecklistFocus(opts?.category ?? null);
    history.replaceState(null, "", next === "overview" ? window.location.pathname : `#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1);
      setTabState(isTab(h) ? h : "overview");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (e.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex !== null) {
      e.preventDefault();
      const t = TABS[nextIndex]!;
      setTab(t.id);
      tabRefs.current[t.id]?.focus();
    }
  };

  return (
    <>
      <div className="min-h-dvh print:hidden">
        <DashboardHeader
          save={save}
          storageAvailable={storageAvailable}
          onExport={data.exportPlan}
          onImport={data.importPlan}
          onReset={data.requestReset}
        />

        <main id="main" className="mx-auto max-w-6xl px-5 pt-8 pb-24 sm:px-8 sm:pt-10">
          <Greeting view={view} />

          <div className="mt-6 space-y-3">
            {!storageAvailable ? (
              <Notice icon={FileWarning} tone="warn" title="Browser storage is unavailable">
                Your plan works for this visit, but changes can&apos;t be saved — storage may be disabled or blocked in
                this browser. Print or export your plan before leaving.
              </Notice>
            ) : null}
            {save.state === "error" && storageAvailable ? (
              <Notice icon={CircleAlert} tone="danger" title="Your latest change couldn't be saved">
                {save.error === "quota" ? "Browser storage is full." : "The browser blocked the save."} Export or print your
                plan to keep a copy.
              </Notice>
            ) : null}
            {upgradedFrom ? (
              <Notice
                icon={RefreshCcw}
                tone="gold"
                title="Recommendations refreshed"
                action={
                  <Button size="sm" variant="secondary" onClick={dismissUpgradeNotice}>
                    Dismiss
                  </Button>
                }
              >
                FORTIS&apos;s preparedness rules were updated, so your task list was regenerated. Your completed tasks were
                kept.
              </Notice>
            ) : null}
          </div>

          <div className="sticky top-16 z-30 -mx-5 mt-8 border-b border-line bg-paper/90 px-5 backdrop-blur-md sm:-mx-8 sm:px-8">
            <div role="tablist" aria-label="Plan sections" className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t, i) => {
                const Icon = t.icon;
                const selected = tab === t.id;
                const badge =
                  t.id === "checklist" ? view.readiness.remaining : t.id === "supplies" ? view.supplySummary.needed : null;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[t.id] = el;
                    }}
                    id={`tab-${t.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={cn(
                      "relative flex h-12 shrink-0 items-center gap-2 rounded-t-lg px-3 text-sm font-semibold transition-colors sm:px-4",
                      selected ? "text-navy" : "text-muted hover:text-navy",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {t.label}
                    {badge ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-px text-[11px] font-bold tabular-nums",
                          selected ? "bg-navy text-paper" : "bg-navy/[0.07] text-navy-600",
                        )}
                        aria-label={`${badge} remaining`}
                      >
                        {badge}
                      </span>
                    ) : null}
                    <span
                      aria-hidden
                      className={cn("absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors", selected ? "bg-gold" : "bg-transparent")}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={-1} className="mt-8 focus:outline-none">
            <div key={tab} className="animate-fade-in">
              {tab === "overview" && <OverviewTab view={view} onNavigate={setTab} data={data} />}
              {tab === "checklist" && <ChecklistTab view={view} initialCategory={checklistFocus} />}
              {tab === "supplies" && <SuppliesTab view={view} />}
              {tab === "contacts" && <ContactsTab view={view} />}
              {tab === "resources" && <ResourcesTab view={view} />}
            </div>
          </div>
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden /> Stored only in this browser. FORTIS does not transmit your plan.
            </p>
            <p>General guidance only — always follow instructions from local officials.</p>
          </div>
        </footer>
      </div>

      <PrintPlan view={view} />
      {data.dialogs}
    </>
  );
}

function DashboardHeader({
  save,
  storageAvailable,
  onExport,
  onImport,
  onReset,
}: {
  save: SaveInfo;
  storageAvailable: boolean;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" aria-label="FORTIS home" className="shrink-0 rounded-lg">
            <Logo />
          </Link>
          <SaveIndicator save={save} storageAvailable={storageAvailable} />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/setup" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            <Pencil aria-hidden /> Edit plan
          </Link>
          <Button variant="primary" size="sm" onClick={() => printPlan("full")}>
            <Printer aria-hidden />
            <span className="hidden sm:inline">Print / Save as PDF</span>
            <span className="sm:hidden">Print</span>
          </Button>
          <Menu
            label="More plan options"
            items={[
              { label: "Edit household profile", icon: Pencil, onSelect: () => router.push("/setup") },
              { label: "Print contact card", icon: Printer, onSelect: () => printPlan("card") },
              { label: "Export plan (JSON)", icon: Download, onSelect: onExport },
              { label: "Import plan (JSON)", icon: Upload, onSelect: onImport },
              { label: "Delete saved plan", icon: Trash2, onSelect: onReset, tone: "danger" },
            ]}
            trigger={(props) => (
              <Button variant="ghost" size="icon" {...props}>
                <Ellipsis className="size-5" aria-hidden />
              </Button>
            )}
          />
        </div>
      </div>
    </header>
  );
}

function SaveIndicator({ save, storageAvailable }: { save: SaveInfo; storageAvailable: boolean }) {
  // "Saved just now" shows for a few seconds after each save, then settles.
  const [settledAt, setSettledAt] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (!save.at) return;
    const at = save.at;
    const id = window.setTimeout(() => setSettledAt(at), 4000);
    return () => window.clearTimeout(id);
  }, [save.at]);

  let text = "Saved on this device";
  let tone = "text-forest";
  let Icon = CircleCheck;
  if (!storageAvailable) {
    text = "Not saved — storage unavailable";
    tone = "text-warn";
    Icon = CircleAlert;
  } else if (save.state === "error") {
    text = "Save failed";
    tone = "text-danger";
    Icon = CircleAlert;
  } else if (save.state === "saved" && save.at) {
    text = settledAt === save.at ? "Saved on this device" : "Saved just now";
  }
  return (
    <p className={cn("hidden items-center gap-1.5 text-xs font-medium md:flex", tone)} role="status" aria-live="polite">
      <Icon className="size-3.5" aria-hidden />
      {text}
    </p>
  );
}

function Greeting({ view }: { view: PlanView }) {
  const { profile } = view.plan;
  const h = profile.household;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const facts = [
    pluralize(h.adults, "adult"),
    h.children ? pluralize(h.children, "child", "children") : null,
    h.olderAdults ? `${h.olderAdults} needing extra help` : null,
    h.pets ? pluralize(h.pets, "pet") : null,
    `${profile.preferences.durationDays}-day plan`,
    pluralize(profile.hazards.length, "hazard"),
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-semibold text-gold-600">{greeting}.</p>
        <h1 className="mt-1 text-[1.9rem] leading-tight font-bold tracking-tight text-navy sm:text-4xl">Your household plan</h1>
        <p className="mt-2 text-[15px] text-navy-600">
          {facts.join(" · ")}
          <span className="text-muted">
            {" "}
            · {describeLocation(profile.location.country, profile.location.region, profile.location.locality)}
          </span>
        </p>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl border border-danger/15 bg-white px-4 py-3 text-[13px] leading-snug text-navy-600 shadow-card md:max-w-sm">
        <Siren className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
        <p>
          <span className="font-semibold text-navy">If officials tell you to evacuate, leave immediately.</span> Never delay to
          finish this checklist or gather supplies.
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── Empty / invalid ───────────────────────── */

function MinimalHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
        <Link href="/" aria-label="FORTIS home" className="rounded-lg">
          <Logo />
        </Link>
      </div>
    </header>
  );
}

function EmptyState({ storageAvailable }: { storageAvailable: boolean }) {
  const data = useDataActions(null);
  return (
    <div className="min-h-dvh">
      <MinimalHeader />
      <main id="main" className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-navy text-gold shadow-raised">
          <ListChecks className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy">You don&apos;t have a plan yet</h1>
        <p className="mt-3 leading-relaxed text-navy-600">
          Answer a few questions about your household and FORTIS will build a personalized, prioritized emergency plan.
          It takes about five minutes.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/setup" className={buttonVariants({ size: "lg" })}>
            Build My Plan
          </Link>
          <Button variant="secondary" size="lg" onClick={data.importPlan}>
            <Upload aria-hidden /> Import a saved plan
          </Button>
        </div>
        {!storageAvailable ? (
          <Notice icon={FileWarning} tone="warn" className="mt-8 text-left">
            Browser storage appears to be disabled, so your plan won&apos;t be saved between visits. You can still build
            and print it.
          </Notice>
        ) : null}
      </main>
      {data.dialogs}
    </div>
  );
}

function InvalidState({ raw, reason }: { raw: string; reason: string }) {
  const backup = () => {
    const blob = new Blob([raw], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fortis-unreadable-backup-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="min-h-dvh">
      <MinimalHeader />
      <main id="main" className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-warn-100 text-warn">
          <FileWarning className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy">We couldn&apos;t read your saved plan</h1>
        <p className="mt-3 leading-relaxed text-navy-600">
          {reason} This can happen if the data was edited or damaged. Your data hasn&apos;t been deleted — you can download
          a backup before starting fresh.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" size="lg" onClick={backup}>
            <Download aria-hidden /> Download backup
          </Button>
          <Button
            size="lg"
            onClick={() => {
              resetPlan();
              toast({ title: "Saved data cleared", description: "You can build a new plan now." });
            }}
          >
            <RefreshCcw aria-hidden /> Start a new plan
          </Button>
        </div>
      </main>
    </div>
  );
}
