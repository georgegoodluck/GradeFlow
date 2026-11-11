import { auth } from "@/auth";
import { db } from "@/db";
import { classes, schools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

async function saveClasses(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const raw = formData.get("classes");
  if (typeof raw !== "string" || raw.trim().length === 0) {
    redirect("/onboarding/classes?error=empty");
  }

  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (names.length === 0) redirect("/onboarding/classes?error=empty");

  // Case-insensitive duplicate check against existing classes for this school
  const existing = await db
    .select({ name: classes.name })
    .from(classes)
    .where(eq(classes.schoolId, session.user.schoolId));

  const existingLower = new Set(existing.map((c) => c.name.toLowerCase()));
  const unique = names.filter((n) => !existingLower.has(n.toLowerCase()));

  if (unique.length > 0) {
    await db.insert(classes).values(
      unique.map((name) => ({
        schoolId: session.user.schoolId!,
        name,
      })),
    );
  }

  // Mark onboarding complete
  await db
    .update(schools)
    .set({ onboardingComplete: true })
    .where(eq(schools.id, session.user.schoolId));

  redirect("/dashboard");
}

export default function ClassesStep() {
  return (
    <form action={saveClasses} className="space-y-4">
      <h2 className="font-playfair text-2xl">Classes</h2>
      <p className="text-sm text-gray-500">
        Enter class names separated by commas (e.g. JSS1, JSS2, JSS3)
      </p>
      <input
        name="classes"
        placeholder="JSS1, JSS2, JSS3"
        required
        className="w-full rounded border p-3"
      />
      <button type="submit" className="rounded bg-gold px-6 py-2 text-charcoal">
        Finish Setup
      </button>
    </form>
  );
}
