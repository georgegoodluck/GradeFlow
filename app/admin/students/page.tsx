export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/PageHeader';
import { createStudent } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect('/login');

  // Fetch classes and students using RLS
  const { classes, students } = await withTenant(session.user.schoolId, async (tx) => {
    const classes = await tx.class.findMany({ orderBy: { name: 'asc' } });
    const students = await tx.student.findMany({
      orderBy: { lastName: 'asc' },
      include: { class: true },
    });
    return { classes, students };
  });

  return (
    <div>
      <PageHeader title="Students" description="Manage student enrollments" />

      <form
        action={createStudent}
        className="shadow-soft mb-8 grid grid-cols-1 gap-2 rounded-lg border bg-white p-4 md:grid-cols-5"
      >
        <Input name="firstName" placeholder="First Name" required />
        <Input name="lastName" placeholder="Last Name" required />
        <Input name="admissionNo" placeholder="Admission No" required />
        <select
          name="classId"
          required
          className="rounded-md border bg-white px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select Class...
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <SubmitButton>Add Student</SubmitButton>
      </form>

      <div className="shadow-soft overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 text-muted-foreground border-b text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Admission No</th>
              <th className="px-6 py-3">Class</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-6 py-4 text-sm font-medium">
                  {s.firstName} {s.lastName}
                </td>
                <td className="px-6 py-4 text-sm">{s.admissionNo}</td>
                <td className="px-6 py-4 text-sm">{s.class.name}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={3} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  No students yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
