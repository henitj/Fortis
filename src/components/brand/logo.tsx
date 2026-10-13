import { cn } from "@/lib/utils";

interface MarkProps {
  className?: string;
  tone?: "light" | "dark";
  title?: string;
}

/**
 * FORTIS emblem: a softened shield enclosing a home — protection for the
 * household, deliberately free of stars, wings or badge motifs.
 */
export function LogoMark({ className, tone = "light", title }: MarkProps) {
  const shield = tone === "dark" ? "#22303c" : "#101820";
  const edge = tone === "dark" ? "rgba(244,242,237,0.18)" : "transparent";
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d="M16 2.25c.32 0 .63.06.93.17l9.2 3.45A2.4 2.4 0 0 1 27.7 8.12v6.66c0 6.7-4.28 11.83-10.86 14.73a2.06 2.06 0 0 1-1.68 0C8.58 26.61 4.3 21.48 4.3 14.78V8.12a2.4 2.4 0 0 1 1.57-2.25l9.2-3.45c.3-.11.61-.17.93-.17Z"
        fill={shield}
        stroke={edge}
        strokeWidth="1"
      />
      <path
        d="M10.6 15.6 15.18 11.7a1.27 1.27 0 0 1 1.64 0l4.58 3.9c.29.24.45.6.45.97v5.68c0 .7-.57 1.27-1.27 1.27h-2.54v-3.6a2.04 2.04 0 0 0-4.08 0v3.6h-2.54c-.7 0-1.27-.57-1.27-1.27v-5.68c0-.37.16-.73.45-.97Z"
        fill="#D9A441"
      />
    </svg>
  );
}

interface LogoProps extends MarkProps {
  showTagline?: boolean;
  markClassName?: string;
}

export function Logo({ className, tone = "light", showTagline, markClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} className={markClassName} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[17px] font-extrabold tracking-[0.2em]",
            tone === "dark" ? "text-paper" : "text-navy",
          )}
        >
          FORTIS
        </span>
        {showTagline ? (
          <span className={cn("mt-1 text-[10.5px] font-medium tracking-wide", tone === "dark" ? "text-paper/60" : "text-muted")}>
            Strength Through Preparation.
          </span>
        ) : null}
      </span>
      <span className="sr-only">FORTIS home</span>
    </span>
  );
}
