import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { SidebarNav } from "@/components/SidebarNav";
import { MobileNav } from "@/components/MobileNav";
import { SignOutButton } from "@/components/SignOutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-soft text-charcoal">
      {/* MOBILE TOP BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-charcoal px-4 text-white md:hidden">
        <h1 className="font-playfair text-lg text-gold">GradeFlow</h1>
        <MobileNav title="GradeFlow" />
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-charcoal p-6 text-white md:flex">
        <div>
          <h1 className="font-playfair text-xl text-gold">GradeFlow</h1>
          <SidebarNav />
        </div>
        <div className="mt-auto border-t border-white/10 pt-6">
          <SignOutButton />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">
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

  if (session.user.userType === "student") redirect("/student");
  if (session.user.role === "teacher") redirect("/teacher");

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
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
