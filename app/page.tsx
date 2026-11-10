import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { OrbWrapper } from "@/components/orb-wrapper";

async function goToSchool(formData: FormData) {
  "use server";
  const slug = formData.get("slug");
  if (typeof slug !== "string" || slug.trim().length === 0) return;

  const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

  const [school] = await db
    .select({ slug: schools.slug })
    .from(schools)
    .where(eq(schools.slug, cleanSlug))
    .limit(1);

  if (school) {
    redirect(`/${school.slug}/login`);
  } else {
    redirect(`/login?error=not_found`);
  }
}

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-charcoal overflow-hidden">
      <div className="z-10 text-center space-y-6 px-6 max-w-2xl">
        <h1 className="font-playfair text-6xl md:text-8xl text-white">
          School <span className="text-gold">Grading</span>
        </h1>
        <p className="text-gray-400 text-lg">
          The premium multi-tenant grading platform for modern institutions.
        </p>

        <form
          action={goToSchool}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <input
            name="slug"
            placeholder="Enter your school code (e.g. han's-academy)"
            required
            className="rounded-lg bg-white/10 border border-white/10 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold w-full sm:w-96"
          />
          <button
            type="submit"
            className="rounded-lg bg-gold px-8 py-4 font-medium text-charcoal hover:bg-[#d4b573] transition"
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

      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex items-center justify-center">
        <OrbWrapper />
      </div>
    </main>
  );
}
