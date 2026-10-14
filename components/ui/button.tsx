import type { ButtonHTMLAttributes } from "react";

export function buttonStyles(
  variant: "primary" | "dark" | "outline" | "ghost" = "primary",
  size: "default" | "small" = "default",
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-[-0.01em] transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-gold";
  const sizes =
    size === "small"
      ? "min-h-10 px-4 text-sm"
      : "min-h-12 px-5 text-sm sm:text-[15px]";
  const variants = {
    primary: "bg-gold text-ink hover:bg-[#e9b659]",
    dark: "bg-ink text-white hover:bg-[#253847]",
    outline:
      "border border-line bg-white text-ink hover:border-slate hover:bg-paper",
    ghost: "text-ink hover:bg-black/5",
  };
  return `${base} ${sizes} ${variants[variant]}`;
}

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "outline" | "ghost";
  size?: "default" | "small";
}) {
  return (
    <button
      className={`${buttonStyles(variant, size)} ${className}`}
      {...props}
    />
  );
}
