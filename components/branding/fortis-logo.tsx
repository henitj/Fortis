export function FortisMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="38"
      height="42"
      viewBox="0 0 38 42"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M19 2.5 34 8v12.2c0 8.7-5.5 14.5-15 19.2C9.5 34.7 4 28.9 4 20.2V8L19 2.5Z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <path
        d="m10.5 23 8.5-9 8.5 9M19 14v16.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 27.5h10"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FortisLogo({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${light ? "text-white" : "text-ink"}`}
      aria-label="FORTIS"
    >
      <FortisMark
        className={`h-9 w-8 shrink-0 ${light ? "text-gold" : "text-forest"}`}
      />
      {!compact && (
        <span className="font-display text-[20px] font-extrabold tracking-[0.19em] leading-none">
          FORTIS
        </span>
      )}
    </span>
  );
}
