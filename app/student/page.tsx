import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { scores, subjects, terms } from "@/db/schema";
import { computeScore } from "@/lib/grading";

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-playfair text-3xl">My Results</h2>
        <p className="text-gray-500 text-sm">
          Active term performance summary.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <StudentResults />
      </Suspense>
    </div>
  );
}

async function StudentResults() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId || !session?.user?.id) redirect("/login");

  // Get active term
  const [activeTerm] = await db
    .select()
    .from(terms)
    .where(
      and(eq(terms.schoolId, session.user.schoolId), eq(terms.isActive, true)),
    )
    .limit(1);

  if (!activeTerm) {
    return (
      <div className="rounded bg-white p-8 text-gray-500 shadow-soft">
        No active term. Please check back later.
      </div>
    );
  }

  // Fetch scores
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
      <div className="rounded bg-white p-8 text-gray-500 shadow-soft">
        No scores recorded for {activeTerm.name} yet.
      </div>
    );
  }

  // Compute totals
  const processedScores = myScores.map((s) => {
    const computed = computeScore({
      ca1: s.ca1,
      ca2: s.ca2,
      ca3: s.ca3,
      exam: s.exam,
    });
    return { ...s, ...computed };
  });

  const grandTotal = processedScores.reduce((sum, s) => sum + s.total, 0);
  const average = grandTotal / processedScores.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-soft">
        <div>
          <p className="text-sm text-gray-500">Term</p>
          <p className="font-medium">
            {activeTerm.name} ({activeTerm.session})
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Average</p>
          <p className="font-medium text-gold text-xl">{average.toFixed(2)}%</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Subject</th>
              <th className="p-4 font-medium text-gray-500">CA1</th>
              <th className="p-4 font-medium text-gray-500">CA2</th>
              <th className="p-4 font-medium text-gray-500">CA3</th>
              <th className="p-4 font-medium text-gray-500">Exam</th>
              <th className="p-4 font-medium text-gray-500">Total</th>
              <th className="p-4 font-medium text-gray-500">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {processedScores.map((s) => (
              <tr key={s.subjectName} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{s.subjectName}</td>
                <td className="p-4">{s.ca1}</td>
                <td className="p-4">{s.ca2}</td>
                <td className="p-4">{s.ca3}</td>
                <td className="p-4">{s.exam}</td>
                <td className="p-4 font-semibold">{s.total}</td>
                <td className="p-4">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
