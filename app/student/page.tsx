import { eq, and } from "drizzle-orm";
import { Award, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { scores, subjects, terms } from "@/db/schema";
import { computeScore } from "@/lib/grading";

export const dynamic = "force-dynamic";

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

  if (!activeTerm)
    return <div className="p-8 text-center text-gray-500">No active term.</div>;

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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="font-playfair text-3xl">My Results</h2>
        <p className="text-gray-500 text-sm">
          Welcome back, {session.user.name}. Here is your performance for{" "}
          {activeTerm.name}.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl bg-charcoal p-6 shadow-soft text-white flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-1">Overall Average</p>
            <p className="text-5xl font-playfair text-gold">{average}%</p>
          </div>
          <TrendingUp className="h-24 w-24 text-white/5 absolute right-4 bottom-4" />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-soft flex flex-col justify-center">
          <p className="text-gray-500 text-sm mb-1">Subjects</p>
          <p className="text-3xl font-semibold text-charcoal">
            {processedScores.length}
          </p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl bg-white shadow-soft">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Subject</th>
              <th className="p-4 text-center font-medium text-gray-500">CA1</th>
              <th className="p-4 text-center font-medium text-gray-500">CA2</th>
              <th className="p-4 text-center font-medium text-gray-500">CA3</th>
              <th className="p-4 text-center font-medium text-gray-500">
                Exam
              </th>
              <th className="p-4 text-center font-medium text-gray-500">
                Total
              </th>
              <th className="p-4 text-center font-medium text-gray-500">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processedScores.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50/70 transition">
                <td className="p-4 font-medium text-charcoal">
                  {s.subjectName}
                </td>
                <td className="p-4 text-center text-gray-600">{s.ca1}</td>
                <td className="p-4 text-center text-gray-600">{s.ca2}</td>
                <td className="p-4 text-center text-gray-600">{s.ca3}</td>
                <td className="p-4 text-center text-gray-600">{s.exam}</td>
                <td className="p-4 text-center font-semibold text-charcoal">
                  {s.total}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${
                      s.grade === "A"
                        ? "bg-green-100 text-green-700"
                        : s.grade === "F"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {processedScores.map((s, i) => (
          <div
            key={i}
            className="rounded-xl bg-white p-5 shadow-soft border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-playfair text-lg text-charcoal">
                  {s.subjectName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Score Breakdown</p>
              </div>
              <span
                className={`rounded-md px-3 py-1.5 text-sm font-bold ${
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

            <div className="grid grid-cols-4 gap-2 text-center mb-4">
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase">CA1</p>
                <p className="font-semibold text-sm">{s.ca1}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase">CA2</p>
                <p className="font-semibold text-sm">{s.ca2}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase">CA3</p>
                <p className="font-semibold text-sm">{s.ca3}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase">Exam</p>
                <p className="font-semibold text-sm">{s.exam}</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-sm font-medium text-gray-500">
                Total Score
              </span>
              <span className="text-lg font-bold text-gold">{s.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
