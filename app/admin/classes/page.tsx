import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';

export default async function ClassesPage() {
  const session = await auth();
  const classes = await prisma.class.findMany({
    where: { schoolId: session!.user.schoolId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { students: true } } },
  });

  return (
    <div>
      <PageHeader title="Classes" description="Primary 1–6" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {classes.map((c) => (
          <div key={c.id} className="shadow-soft rounded-lg border bg-white p-6">
            <p className="font-serif text-xl">{c.name}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {c._count.students} student{c._count.students === 1 ? '' : 's'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
