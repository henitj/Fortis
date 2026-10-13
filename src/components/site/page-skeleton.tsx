export function PageSkeleton({ label = "Loading your plan…" }: { label?: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6" role="status" aria-live="polite">
      <div className="flex w-full max-w-md flex-col gap-3" aria-hidden>
        <div className="h-6 w-1/2 animate-pulse rounded-lg bg-navy/[0.06]" />
        <div className="h-32 animate-pulse rounded-2xl bg-navy/[0.05]" />
        <div className="h-20 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
