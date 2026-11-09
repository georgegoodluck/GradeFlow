import { AppShell } from '@/components/AppShell';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.staff) redirect('/login');

  // Check if onboarding is complete
  const school = await prisma.school.findUnique({
    where: { id: session.staff.schoolId }
  });

  if (!school?.isSetup) {
    redirect('/onboarding');
  }

  return <AppShell>{children}</AppShell>;
}