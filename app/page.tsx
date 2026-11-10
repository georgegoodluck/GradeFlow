// app/page.tsx
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { OrbWrapper } from "@/components/orb-wrapper";

async function goToSchool(formData: FormData) {
  "use server";
  const code = formData.get("code");
  if (typeof code !== "string" || code.trim().length === 0) return;

  const cleanSlug = code.trim().toLowerCase().replace(/\s+/g, "-");

  const [school] = await db
    .select({ code: schools.code })
    .from(schools)
    .where(eq(schools.code, cleanSlug))
    .limit(1);

  if (school) {
    redirect(`/${school.code}/login`);
  } else {
    redirect(`/login?error=not_found`);
  }
}

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-charcoal">
      <div className="z-10 max-w-2xl space-y-6 px-4 text-center">
        <h1 className="font-playfair text-5xl text-white sm:text-6xl md:text-8xl">
          Grade<span className="text-gold">Flow</span>
        </h1>
        <p className="text-base text-gray-400 sm:text-lg">
          The premium multi-tenant grading platform for modern institutions.
        </p>

        <form
          action={goToSchool}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <input
            name="code"
            placeholder="Enter school code"
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

        <div className="pt-4 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-gold hover:underline">
            Register your school
          </a>
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
