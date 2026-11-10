// app/student/page.tsx
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { scores, subjects, terms } from "@/db/schema";
import { computeScore } from "@/lib/grading";

export const dynamic = "force-dynamic"; // Force Next.js to render this on every request

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user?.schoolId || !session?.user?.id) {
    return (
      <div className="p-8 text-center text-red-500">
        Session error. Please re-login.
      </div>
    );
  }

  const [activeTerm] = await db
    .select()
    .from(terms)
    .where(
      and(eq(terms.schoolId, session.user.schoolId), eq(terms.isActive, true)),
    )
    .limit(1);

  if (!activeTerm) {
    return <div className="p-8 text-center text-gray-500">No active term.</div>;
  }

  const myScores = await db
    .select({
      subjectName: subjects.name,
      ca1: scores.ca1,
      ca2: scores.ca2,
      ca3: scores.ca3,
      exam: scores.exam,
    })
    .from(scores)
    .innerJoin(subjects, eq(scores.subjectId, subjects.id))
    .where(
      and(
        eq(scores.schoolId, session.user.schoolId),
        eq(scores.studentId, session.user.id),
        eq(scores.termId, activeTerm.id),
      ),
    );

  if (myScores.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No results available yet.
      </div>
    );
  }

  const processedScores = myScores.map((s) => ({
    ...s,
    ...computeScore({ ca1: s.ca1, ca2: s.ca2, ca3: s.ca3, exam: s.exam }),
  }));

  const grandTotal = processedScores.reduce((sum, s) => sum + s.total, 0);
  const average = (grandTotal / processedScores.length).toFixed(2);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-playfair text-3xl">My Results</h2>
        <p className="text-gray-500 text-sm">
          Your scores for the current term.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 rounded-lg bg-white p-4 shadow-soft">
          <div>
            <p className="text-sm text-gray-500">Term</p>
            <p className="font-medium text-gold">
              {activeTerm.name} ({activeTerm.session})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average</p>
            <p className="font-medium text-gold text-xl">{average}%</p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-lg bg-white shadow-soft md:block">
          <table className="w-full text-sm text-left">
            <thead className="bg-charcoal text-white">
              <tr>
                <th className="p-3 font-medium">Subject</th>
                <th className="p-3 text-center font-medium">CA1</th>
                <th className="p-3 text-center font-medium">CA2</th>
                <th className="p-3 text-center font-medium">CA3</th>
                <th className="p-3 text-center font-medium">Exam</th>
                <th className="p-3 text-center font-medium">Total</th>
                <th className="p-3 text-center font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {processedScores.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="p-3">{s.subjectName}</td>
                  <td className="p-3 text-center">{s.ca1}</td>
                  <td className="p-3 text-center">{s.ca2}</td>
                  <td className="p-3 text-center">{s.ca3}</td>
                  <td className="p-3 text-center">{s.exam}</td>
                  <td className="p-3 text-center font-medium">{s.total}</td>
                  <td className="p-3 text-center font-medium text-gold">
                    {s.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
          {processedScores.map((s, i) => (
            <div key={i} className="rounded-lg bg-white p-4 shadow-soft">
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium">{s.subjectName}</p>
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    s.grade === "A"
                      ? "bg-green-100 text-green-700"
                      : s.grade === "F"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {s.grade}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">CA1</p>
                  <p className="font-semibold">{s.ca1}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">CA2</p>
                  <p className="font-semibold">{s.ca2}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">CA3</p>
                  <p className="font-semibold">{s.ca3}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Exam</p>
                  <p className="font-semibold">{s.exam}</p>
                </div>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold">{s.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
