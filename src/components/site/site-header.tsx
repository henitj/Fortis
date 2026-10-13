"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PlanCta } from "@/components/site/plan-cta";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#methodology", label: "Methodology" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-200 print:hidden",
        scrolled || open ? "border-line bg-paper/90 backdrop-blur-md" : "border-transparent bg-paper/0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="rounded-lg" aria-label="FORTIS home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy/5 hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
          <PlanCta size="sm" className="ml-3" />
        </nav>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl text-navy hover:bg-navy/5 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div id="mobile-nav" hidden={!open} className="border-t border-line bg-paper px-5 pt-2 pb-5 md:hidden">
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-[15px] font-medium text-navy hover:bg-navy/5"
            >
              {item.label}
            </Link>
          ))}
          <PlanCta className="mt-3 w-full" size="lg" onNavigate={() => setOpen(false)} />
        </nav>
      </div>
    </header>
  );
}
