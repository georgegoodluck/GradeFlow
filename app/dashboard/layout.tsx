import { SidebarNav } from "@/components/SidebarNav";
import { MobileNav } from "@/components/MobileNav";
import { SignOutButton } from "@/components/SignOutButton";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-soft text-charcoal">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-charcoal px-4 text-white md:hidden">
        <h1 className="font-playfair text-lg text-gold">GradeFlow</h1>
        <MobileNav title="GradeFlow" />
      </header>
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-charcoal p-6 text-white md:flex">
        <div>
          <h1 className="font-playfair text-xl text-gold">GradeFlow</h1>
          <SidebarNav />
        </div>
        <div className="mt-auto border-t border-white/10 pt-6">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8">{children}</main>
    </div>
  );
}
