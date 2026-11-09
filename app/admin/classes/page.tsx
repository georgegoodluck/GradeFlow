import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { createClass } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function ClassesPage() {
  const session = await auth();
  const classes = await prisma.class.findMany({
    where: { schoolId: session!.user.schoolId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { students: true } } },
  });

  return (
    <div>
      <PageHeader title="Classes" description="Manage your school's classes" />

      <form action={createClass} className="mb-6 flex gap-2">
        <Input name="name" placeholder="e.g. JSS 1A, Primary 1" required className="max-w-xs" />
        <Button type="submit">Add Class</Button>
      </form>

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
