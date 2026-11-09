import Link from 'next/link';
import { auth } from '@/auth';
import { SignOutButton } from './SignOutButton';

const NAV_BY_ROLE: Record<string, { href: string; label: string }[]> = {
  OWNER: [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/students', label: 'Students' },
    { href: '/admin/classes', label: 'Classes' },
    { href: '/admin/subjects', label: 'Subjects' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/assignments', label: 'Assignments' },
    { href: '/admin/terms', label: 'Terms' },
  ],
  ADMIN: [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/classes', label: 'Classes' },
    { href: '/admin/subjects', label: 'Subjects' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/assignments', label: 'Assignments' },
    { href: '/admin/terms', label: 'Terms' },
    { href: '/admin/students', label: 'Students' },
  ],
  TEACHER: [
    { href: '/teacher', label: 'My Subjects' },
    { href: '/teacher/scores', label: 'Enter Scores' },
  ],
  STUDENT: [{ href: '/student', label: 'My Results' }],
};

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role ?? '';
  const nav = NAV_BY_ROLE[role] ?? [];

  return (
    <div className="bg-cream min-h-screen">
      <header className="border-border border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-ink text-gold flex h-9 w-9 items-center justify-center rounded-md">
              <span className="font-serif text-lg">G</span>
            </div>
            <span className="font-serif text-lg tracking-tight">
              {process.env.NEXT_PUBLIC_APP_NAME ?? 'Grading'}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">{session?.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="w-52 shrink-0">
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:bg-secondary hover:text-ink block rounded-md px-3 py-2 text-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
