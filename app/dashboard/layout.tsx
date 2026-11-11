import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const [school] = await db
    .select({ onboardingComplete: schools.onboardingComplete })
    .from(schools)
    .where(eq(schools.id, session.user.schoolId))
    .limit(1);

  if (!school?.onboardingComplete) redirect("/onboarding/school");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-charcoal p-6 text-white">
        <h1 className="font-playfair text-xl text-gold">Grading SaaS</h1>
        <nav className="mt-8 space-y-3 text-sm">
          <a href="/dashboard" className="block hover:text-gold">
            Dashboard
          </a>
          <a href="/dashboard/classes" className="block hover:text-gold">
            Classes
          </a>
          <a href="/dashboard/subjects" className="block hover:text-gold">
            Subjects
          </a>
          <a href="/dashboard/staff" className="block hover:text-gold">
            Staff
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
