export const dynamic = 'force-dynamic';

import { PageHeader } from '@/components/PageHeader';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { redirect } from 'next/navigation';

export default async function AdminHome() {
  const session = await auth();
  if (!session?.staff?.schoolId) redirect('/login');

  // Use withTenant to get accurate counts
  const school = await withTenant(session.staff.schoolId, async (tx) => {
    return tx.school.findUnique({
      where: { id: session.staff.schoolId },
      include: {
        _count: { select: { students: true, staffs: true, classes: true, subjects: true } },
      },
    });
  });

  const stats = [
    { label: 'Students', value: school?._count.students ?? 0 },
    { label: 'Staff', value: school?._count.staffs ?? 0 },
    { label: 'Classes', value: school?._count.classes ?? 0 },
    { label: 'Subjects', value: school?._count.subjects ?? 0 },
  ];

  return (
    <div>
      <PageHeader title={school?.name ?? 'School'} description="Overview" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="shadow-soft rounded-lg border bg-white p-6">
            <p className="text-muted-foreground text-xs tracking-wider uppercase">{s.label}</p>
            <p className="mt-2 font-serif text-3xl">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
