import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { assignTeacher, unassignTeacher } from './actions';
import { SubmitButton } from '@/components/SubmitButton';

export default async function AssignmentsPage() {
  const session = await auth();
  const schoolId = session!.user.schoolId;

  const [teachers, subjects, classes, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { schoolId, role: 'TEACHER' },
      orderBy: { name: 'asc' },
    }),
    prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    prisma.class.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    prisma.teacherSubject.findMany({
      where: { schoolId },
      include: { teacher: true, subject: true, class: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Which teacher teaches which subject in which class"
      />
      <form
        action={assignTeacher}
        className="shadow-soft mb-8 grid grid-cols-1 gap-2 rounded-lg border bg-white p-4 md:grid-cols-4"
      >
        <select
          name="teacherId"
          required
          className="rounded-md border bg-white px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select teacher…
          </option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
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
        <SubmitButton>Assign Teacher</SubmitButton>
      </form>

      <div className="shadow-soft overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-3">Teacher</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  No assignments yet.
                </td>
              </tr>
            )}
            {assignments.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="px-6 py-4 text-sm">{a.teacher.name}</td>
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
