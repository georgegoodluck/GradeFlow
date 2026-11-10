// app/teacher/layout.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LayoutDashboard, PenLine } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { SignOutButton } from "@/components/SignOutButton";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-soft text-charcoal">
      {/* MOBILE TOP BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-charcoal px-4 text-white md:hidden">
        <h1 className="font-playfair text-lg text-gold">Teacher Portal</h1>
        <MobileNav title="Teacher Portal" />
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-charcoal p-6 text-white md:flex">
        <h1 className="font-playfair text-xl text-gold">Teacher Portal</h1>
        <nav className="mt-8 space-y-2 text-sm">
          <Link
            href="/teacher"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" /> My Classes
          </Link>
          <Link
            href="/teacher/scores"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            <PenLine className="h-4 w-4" /> Enter Scores
          </Link>
        </nav>
        <div className="mt-auto border-t border-white/10 pt-6">
          <SignOutButton />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">
        <Suspense fallback={<TeacherSkeleton />}>
          <TeacherGuard>{children}</TeacherGuard>
        </Suspense>
      </main>
    </div>
  );
}

async function TeacherGuard({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (
    session.user.userType !== "staff" ||
    (session.user.role !== "teacher" && session.user.role !== "admin")
  ) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}

function TeacherSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-32 rounded-lg bg-gray-200" />
        <div className="h-32 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
