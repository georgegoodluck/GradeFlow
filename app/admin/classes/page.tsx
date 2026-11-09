export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant'; // <--- Use tenant!
import { PageHeader } from '@/components/PageHeader';
import { createClass } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect('/login');

  // 1. WE MUST USE withTenant HERE
  const classes = await withTenant(session.user.schoolId, async (tx) => {
    return tx.class.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { students: true } } },
    });
  });

  return (
    <div>
      <PageHeader title="Classes" description="Manage your school's classes" />

      <form action={createClass} className="mb-6 flex gap-2">
        <Input name="name" placeholder="e.g. JSS 1A, Primary 1" required className="max-w-xs" />
        <SubmitButton>Add Class</SubmitButton>
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
