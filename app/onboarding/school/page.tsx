import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { saveSchoolName } from "@/app/actions/admin";

export default function SchoolStep() {
  return (
    <Suspense fallback={<SchoolSkeleton />}>
      <SchoolForm />
    </Suspense>
  );
}

async function SchoolForm() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, session.user.schoolId))
    .limit(1);

  if (school?.onboardingComplete) redirect("/dashboard");

  return (
    <form action={saveSchoolName} className="space-y-4">
      <h2 className="font-playfair text-2xl">School Name</h2>
      <input
        name="name"
        defaultValue={school?.name ?? ""}
        placeholder="e.g. Han's Academy"
        required
        className="w-full rounded border p-3"
      />
      <button type="submit" className="rounded bg-gold px-6 py-2 text-charcoal">
        Continue
      </button>
    </form>
  );
}

function SchoolSkeleton() {
  return <div className="h-40 w-full animate-pulse rounded bg-gray-200" />;
}
