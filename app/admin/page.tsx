import { PageHeader } from '@/components/PageHeader';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminHome() {
  const session = await auth();
  const school = await prisma.school.findUnique({
    where: { id: session!.user.schoolId },
    include: {
      _count: { select: { students: true, users: true, classes: true, subjects: true } },
    },
  });

  const stats = [
    { label: 'Students', value: school?._count.students ?? 0 },
    { label: 'Staff', value: school?._count.users ?? 0 },
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
