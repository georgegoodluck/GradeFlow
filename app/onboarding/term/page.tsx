import { auth } from "@/auth";
import { db } from "@/db";
import { terms } from "@/db/schema";
import { redirect } from "next/navigation";

async function saveTerm(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    redirect("/onboarding/term?error=empty");
  }

  await db.insert(terms).values({
    schoolId: session.user.schoolId,
    name: name.trim(),
    isActive: true,
  });

  redirect("/onboarding/classes");
}

export default function TermStep() {
  return (
    <form action={saveTerm} className="space-y-4">
      <h2 className="font-playfair text-2xl">First Term</h2>
      <input
        name="name"
        placeholder="e.g. First Term 2025/2026"
        required
        className="w-full rounded border p-3"
      />
      <button type="submit" className="rounded bg-gold px-6 py-2 text-charcoal">
        Continue
      </button>
    </form>
  );
}
