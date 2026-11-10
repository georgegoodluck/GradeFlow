import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { SidebarNav } from "@/components/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-soft text-charcoal">
      <aside className="w-64 border-r border-gray-200 bg-charcoal p-6 text-white flex flex-col">
        <div>
          <h1 className="font-playfair text-xl text-gold">Grading SaaS</h1>
          <SidebarNav />
        </div>

        {/* Sign out section at the bottom */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardGuard>{children}</DashboardGuard>
        </Suspense>
      </main>
    </div>
  );
}

async function DashboardGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  // Role-based redirection
  if (session.user.userType === "student") redirect("/student");
  if (session.user.role === "teacher") redirect("/teacher");

  // Owner/Admin continues to dashboard
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
