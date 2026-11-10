import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { OrbWrapper } from "@/components/orb-wrapper";
import Link from "next/link";

async function goToSchool(formData: FormData) {
  "use server";
  const code = formData.get("code");
  if (typeof code !== "string" || code.trim().length === 0) return;

  const cleanCode = code.trim().toUpperCase();

  const [school] = await db
    .select({ code: schools.code })
    .from(schools)
    .where(eq(schools.code, cleanCode))
    .limit(1);

  if (school) {
    redirect(`/login?schoolCode=${school.code}`);
  } else {
    redirect(`/login?error=not_found`);
  }
}

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-charcoal">
      <div className="z-10 max-w-2xl space-y-8 px-4 text-center">
        <h1 className="font-playfair text-5xl text-white sm:text-6xl md:text-8xl">
          Grade<span className="text-gold">Flow</span>
        </h1>
        <p className="text-base text-gray-400 sm:text-lg">
          The premium multi-tenant grading platform for modern institutions.
        </p>

        {/* School code lookup — the primary entry point */}
        <form
          action={goToSchool}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <input
            name="code"
            placeholder="Enter your school code (GDF-XX-XXX)"
            required
            className="w-full rounded-lg border border-white/10 bg-white/10 px-6 py-4 text-white placeholder-gray-400 focus:border-gold focus:outline-none sm:w-96"
          />
          <button
            type="submit"
            className="rounded-lg bg-gold px-8 py-4 font-medium text-charcoal transition hover:bg-[#d4b573]"
          >
            Go to Portal
          </button>
        </form>

        {/* Secondary actions */}
        <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg border border-white/20 bg-transparent px-8 py-4 font-medium text-white transition hover:bg-white/5"
          >
            Login to Portal
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/20 bg-transparent px-8 py-4 font-medium text-white transition hover:bg-white/5"
          >
            Register School
          </Link>
        </div>
      </div>

      {/* Orb: centered on mobile, shifted right on desktop */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30 sm:opacity-40">
        <div className="h-[400px] w-[400px] sm:h-[800px] sm:w-[800px] sm:translate-x-1/3">
          <OrbWrapper />
        </div>
      </div>
    </main>
  );
}
