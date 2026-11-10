import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-soft text-charcoal">
      <aside className="w-64 border-r border-gray-200 bg-charcoal p-6 text-white">
        <h1 className="font-playfair text-xl text-gold">Teacher Portal</h1>
        <nav className="mt-8 space-y-3 text-sm">
          <a href="/teacher" className="block hover:text-gold transition">
            My Classes
          </a>
          <a
            href="/teacher/scores"
            className="block hover:text-gold transition"
          >
            Enter Scores
          </a>
        </nav>
        <div className="mt-12 pt-6 border-t border-white/10">
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

  // Ensure only teachers or admins can access this portal
  if (
    session.user.userType !== "staff" ||
    (session.user.role !== "teacher" && session.user.role !== "admin")
  ) {
    redirect("/dashboard"); // If they are an owner, send them to the admin dashboard
  }

  return <>{children}</>;
}

function TeacherSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
