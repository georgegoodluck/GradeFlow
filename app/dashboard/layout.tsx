import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-soft text-charcoal">
      <aside className="w-64 border-r border-gray-200 bg-charcoal p-6 text-white">
        <h1 className="font-playfair text-xl text-gold">Grading SaaS</h1>
        <nav className="mt-8 space-y-3 text-sm">
          <a href="/dashboard" className="block hover:text-gold transition">
            Dashboard
          </a>
          <a
            href="/dashboard/classes"
            className="block hover:text-gold transition"
          >
            Classes
          </a>
          <a
            href="/dashboard/subjects"
            className="block hover:text-gold transition"
          >
            Subjects
          </a>
          <a
            href="/dashboard/staff"
            className="block hover:text-gold transition"
          >
            Staff
          </a>
          <a
            href="/dashboard/students"
            className="block hover:text-gold transition"
          >
            Students
          </a>
          <a
            href="/dashboard/assignments"
            className="block hover:text-gold transition"
          >
            Assignments
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardGuard>{children}</DashboardGuard>
        </Suspense>
      </main>
    </div>
  );
}

// This component does the dynamic work
async function DashboardGuard({ children }: { children: React.ReactNode }) {
  await connection(); // Tells Next 16 this is dynamic

  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  // Students get routed to their own portal (Phase 5)
  if (session.user.userType === "student") {
    redirect("/student");
  }

  // Teachers get routed to the teacher portal
  if (session.user.role === "teacher") {
    redirect("/teacher");
  }

  // Only owners and admins reach here
  const [school] = await db
    .select({ onboardingComplete: schools.onboardingComplete })
    .from(schools)
    .where(eq(schools.id, session.user.schoolId))
    .limit(1);

  if (!school?.onboardingComplete) redirect("/onboarding/school");

  return <>{children}</>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
