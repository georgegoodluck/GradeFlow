// app/page.tsx
import Link from "next/link";
import { OrbWrapper } from "@/components/OrbWrapper";
import { ArrowRight, LogIn } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-charcoal">
      <div className="z-10 max-w-2xl space-y-8 px-6 text-center">
        <div className="space-y-4">
          <h1 className="font-playfair text-5xl text-white sm:text-6xl md:text-8xl">
            Grade<span className="text-gold">Flow</span>
          </h1>
          <p className="text-base text-gray-400 sm:text-lg max-w-lg mx-auto">
            The simplest way to manage your school&apos;  s results. Built for speed,
            security, and beautiful report cards.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-8 py-4 font-medium text-charcoal transition hover:bg-[#d4b573] sm:w-auto"
          >
            <LogIn className="h-5 w-5" /> Sign In to Portal
          </Link>

          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-4 font-medium text-white transition hover:bg-white/10 sm:w-auto"
          >
            Register a School <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="pt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div> Secure
          </span>
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gold"></div> Fast
          </span>
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div> Reliable
          </span>
        </div>
      </div>

      {/* Background 3D Orb */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30 sm:opacity-40">
        <div className="h-[400px] w-[400px] sm:h-[800px] sm:w-[800px] sm:translate-x-1/3">
          <OrbWrapper />
        </div>
      </div>
    </main>
  );
}
