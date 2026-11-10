import { redirect } from "next/navigation";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { eq } from "drizzle-orm";

async function findSchool(formData: FormData) {
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

export default function GenericLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <form
        action={findSchool}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white/5 p-10 shadow-2xl backdrop-blur-xl border border-white/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl text-white font-playfair">
            Find Your School
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Enter your school code to access your portal
          </p>
        </div>

        <input
          name="slug"
          placeholder="School Code (e.g. Hans-academy)"
          required
          className="w-full rounded-lg bg-white/10 border border-white/10 p-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold transition"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-gold p-4 font-medium text-charcoal hover:bg-[#d4b573] transition shadow-[0_0_15px_rgba(198,166,100,0.3)]"
        >
          Continue
        </button>

        <div className="text-center pt-4 border-t border-white/10 mt-6">
          <a href="/register" className="text-sm text-gold hover:underline">
            Register a new school
          </a>
        </div>
      </form>
    </div>
  );
}
