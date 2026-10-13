import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Link href="/" aria-label="FORTIS home">
        <Logo />
      </Link>
      <p className="mt-12 text-sm font-semibold uppercase tracking-[0.12em] text-gold-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">This page doesn&apos;t exist</h1>
      <p className="mt-3 max-w-md text-muted">The link may be mistyped or out of date. Your saved plan is unaffected.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/plan" className={buttonVariants()}>
          Go to my plan
        </Link>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
