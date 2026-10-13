"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Logged locally only — FORTIS sends no telemetry.
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-12 text-3xl font-bold tracking-tight text-navy">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted">
        An unexpected error interrupted this page. Your plan is stored in this browser and has not been deleted.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "secondary" })}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
