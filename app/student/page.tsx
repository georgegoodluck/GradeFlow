export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/PageHeader';
import { redirect } from 'next/navigation';

export default async function StudentDashboard() {
  const session = await auth();
  // Ensure they are a student and have a schoolId
  if (!session?.user?.schoolId || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  // Fetch their student profile, active term, and their scores
  const data = await withTenant(session.user.schoolId, async (tx) => {
    const student = await tx.student.findUnique({
      where: { userId: session.user.id },
      include: { class: true },
    });

    const activeTerm = await tx.term.findFirst({
      where: { isActive: true },
    });

    const scores =
      activeTerm && student
        ? await tx.score.findMany({
            where: { studentId: student.id, termId: activeTerm.id },
            include: { subject: true },
          })
        : [];

    return { student, activeTerm, scores };
  });

  if (!data.student) {
    return <div className="p-8 text-center">Student profile not found. Contact your admin.</div>;
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${data.student.firstName}`}
        description={`Class: ${data.student.class.name} | Adm No: ${data.student.admissionNo}`}
      />

      <div className="shadow-soft mb-8 rounded-lg border bg-white p-6">
        <h3 className="mb-4 font-serif text-xl">Current Term Results</h3>
        {!data.activeTerm ? (
          <p className="text-sm text-gray-500">No active term has been set yet.</p>
        ) : data.scores.length === 0 ? (
          <p className="text-sm text-gray-500">No scores have been entered for this term yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">CA Average</th>
                <th className="px-4 py-2">Exam</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Grade</th>
                <th className="px-4 py-2">Position</th>
              </tr>
            </thead>
            <tbody>
              {data.scores.map((score) => (
                <tr key={score.id} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{score.subject.name}</td>
                  <td className="px-4 py-2">{score.caAverage.toFixed(1)}</td>
                  <td className="px-4 py-2">{score.exam}</td>
                  <td className="px-4 py-2 font-bold">{score.total.toFixed(1)}</td>
                  <td className="px-4 py-2">
                    <span className="bg-gold/20 text-gold-dark rounded px-2 py-1 font-bold">
                      {score.grade}
                    </span>
                  </td>
                  <td className="px-4 py-2">{score.subjectRank || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
