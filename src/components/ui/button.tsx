import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-navy text-paper shadow-card hover:bg-navy-700",
        accent: "bg-gold text-navy shadow-card hover:bg-[#e2b053]",
        secondary: "border border-line-strong bg-white text-navy shadow-card hover:border-navy-600/40 hover:bg-paper",
        ghost: "text-navy hover:bg-navy/5",
        subtle: "bg-navy/5 text-navy hover:bg-navy/10",
        danger: "bg-danger text-white shadow-card hover:bg-[#9a1e14]",
        "danger-ghost": "text-danger hover:bg-danger-100",
        link: "h-auto rounded-md px-0 text-navy underline-offset-4 hover:underline",
        inverse: "border border-white/15 bg-white/5 text-paper hover:bg-white/10",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "size-10",
        "icon-sm": "size-8 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
