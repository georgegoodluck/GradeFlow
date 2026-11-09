import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { saveScore } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';

export default async function ScoresPage() {
  const session = await auth();
  const schoolId = session!.user.schoolId;

  // 1. Get Active Term
  const activeTerm = await prisma.term.findFirst({
    where: { schoolId, isActive: true },
  });

  if (!activeTerm) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        No active term found. Ask your admin to activate a term.
      </div>
    );
  }

  // 2. Get Teacher's Assignments (or all for Admin)
  const role = session!.user.role;
  const assignments = await prisma.teacherSubject.findMany({
    where: {
      schoolId,
      ...(role === 'TEACHER' ? { teacherId: session!.user.id } : {}),
    },
    include: { subject: true, class: true },
  });

  // 3. Get all students for those classes
  const classIds = [...new Set(assignments.map((a) => a.classId))];
  const students = await prisma.student.findMany({
    where: { schoolId, classId: { in: classIds } },
    orderBy: { lastName: 'asc' },
  });

  return (
    <div>
      <PageHeader
        title="Enter Scores"
        description={`Active Term: ${activeTerm.session} - ${activeTerm.name}`}
      />

      <div className="space-y-12">
        {assignments.map((assign) => (
          <div key={assign.id} className="shadow-soft overflow-hidden rounded-lg border bg-white">
            <div className="bg-secondary/50 border-b px-6 py-4">
              <h3 className="font-serif text-lg">
                {assign.subject.name} - {assign.class.name}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-4 py-3">CA1 (40)</th>
                    <th className="px-4 py-3">CA2 (40)</th>
                    <th className="px-4 py-3">CA3 (40)</th>
                    <th className="px-4 py-3">Exam (60)</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter((s) => s.classId === assign.classId)
                    .map((student) => (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="px-6 py-3 font-medium">
                          {student.firstName} {student.lastName}
                        </td>
                        <form
                          action={async (formData) => {
                            'use server';
                            const ca1 = Number(formData.get(`ca1_${student.id}`));
                            const ca2 = Number(formData.get(`ca2_${student.id}`));
                            const ca3 = Number(formData.get(`ca3_${student.id}`));
                            const exam = Number(formData.get(`exam_${student.id}`));
                            await saveScore(
                              student.id,
                              assign.subjectId,
                              activeTerm.id,
                              ca1,
                              ca2,
                              ca3,
                              exam,
                            );
                          }}
                        >
                          <td className="px-4 py-3">
                            <Input
                              name={`ca1_${student.id}`}
                              type="number"
                              min="0"
                              max="40"
                              required
                              className="h-8 w-20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              name={`ca2_${student.id}`}
                              type="number"
                              min="0"
                              max="40"
                              required
                              className="h-8 w-20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              name={`ca3_${student.id}`}
                              type="number"
                              min="0"
                              max="40"
                              required
                              className="h-8 w-20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              name={`exam_${student.id}`}
                              type="number"
                              min="0"
                              max="60"
                              required
                              className="h-8 w-20"
                            />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <SubmitButton size="sm" variant="outline">
                              Save
                            </SubmitButton>
                          </td>
                        </form>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
