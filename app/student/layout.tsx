import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { Award } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { SignOutButton } from "@/components/SignOutButton";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-soft text-charcoal">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-charcoal px-4 text-white md:hidden">
        <h1 className="font-playfair text-lg text-gold">Student Portal</h1>
        <MobileNav title="Student Portal" />
      </header>

      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-charcoal p-6 text-white md:flex">
        <h1 className="font-playfair text-xl text-gold">Student Portal</h1>
        <nav className="mt-8 space-y-2 text-sm">
          <a
            href="/student"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            <Award className="h-4 w-4" /> My Results
          </a>
        </nav>
        <div className="mt-auto border-t border-white/10 pt-6">
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">
        <Suspense fallback={<StudentSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}

function StudentSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 rounded bg-gray-200" />
      <div className="h-64 rounded-lg bg-gray-200" />
    </div>
  );
}
