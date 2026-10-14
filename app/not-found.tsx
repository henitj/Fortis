import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FortisLogo } from "@/components/branding/fortis-logo";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-start justify-center px-6">
      <FortisLogo />
      <p className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-forest">
        Page not found
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold tracking-[-0.05em]">
        Let&apos;s find your way back.
      </h1>
      <p className="mt-4 text-slate">
        This page isn&apos;t here, but your next step is close.
      </p>
      <Link href="/" className={`${buttonStyles("dark")} mt-8`}>
        <ArrowLeft size={17} /> Return home
      </Link>
    </main>
  );
}
