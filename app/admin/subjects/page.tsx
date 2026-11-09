import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/PageHeader';
import { createSubject, deleteSubject } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect('/login');

  const subjects = await withTenant(session.user.schoolId, async (tx) => {
    return tx.subject.findMany({
      orderBy: { name: 'asc' },
    });
  });

  return (
    <div>
      <PageHeader title="Subjects" description="The subjects taught at your school" />
      <form action={createSubject} className="mb-6 flex gap-2">
        <Input name="name" placeholder="e.g. Mathematics" required className="max-w-xs" />
        <SubmitButton>Add subject</SubmitButton>
      </form>
      <div className="shadow-soft overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 && (
              <tr>
                <td colSpan={2} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  No subjects yet. Add your first one above.
                </td>
              </tr>
            )}
            {subjects.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-6 py-4 text-sm">{s.name}</td>
                <td className="px-6 py-4 text-right">
                  <form
                    action={async () => {
                      'use server';
                      await deleteSubject(s.id);
                    }}
                  >
                    <SubmitButton variant="ghost" size="sm">
                      Delete
                    </SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
