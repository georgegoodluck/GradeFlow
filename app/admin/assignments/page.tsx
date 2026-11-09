export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/PageHeader';
import { assignTeacher, unassignTeacher } from './actions';
import { SubmitButton } from '@/components/SubmitButton';

export default async function AssignmentsPage() {
  const session = await auth();
  const schoolId = session!.user.schoolId;

  const { teachers, subjects, classes, assignments } = await withTenant(schoolId, async (tx) => {
    const teachers = await tx.staff.findMany({
      where: { role: 'TEACHER' },
      orderBy: { firstName: 'asc' },
    });
    const subjects = await tx.subject.findMany({ orderBy: { name: 'asc' } });
    const classes = await tx.class.findMany({ orderBy: { name: 'asc' } });
    const assignments = await tx.teacherSubject.findMany({
      include: { staff: true, subject: true, class: true },
    });
    return { teachers, subjects, classes, assignments };
  });

  return (
    <div>
      <PageHeader title="Assignments" description="Assign teachers to subjects and classes" />

      <form
        action={assignTeacher}
        className="shadow-soft mb-8 grid grid-cols-1 gap-2 rounded-lg border bg-white p-4 md:grid-cols-4"
      >
        <select
          name="staffId"
          required
          className="rounded-md border bg-white px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select teacher…
          </option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
        <select
          name="subjectId"
          required
          className="rounded-md border bg-white px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select subject…
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          name="classId"
          required
          className="rounded-md border bg-white px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select class…
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <SubmitButton>Assign</SubmitButton>
      </form>

      <div className="shadow-soft overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 text-muted-foreground border-b text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-3">Teacher</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="px-6 py-4 text-sm">
                  {a.staff.firstName} {a.staff.lastName}
                </td>
                <td className="px-6 py-4 text-sm">{a.subject.name}</td>
                <td className="px-6 py-4 text-sm">{a.class.name}</td>
                <td className="px-6 py-4 text-right">
                  <form
                    action={async () => {
                      'use server';
                      await unassignTeacher(a.id);
                    }}
                  >
                    <SubmitButton variant="ghost" size="sm">
                      Remove
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
