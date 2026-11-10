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
        <h2 className="font-playfair text-3xl font-semibold text-charcoal">
          My Results
        </h2>
        <p className="text-sm text-gray-500">
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
      <div className="rounded-lg bg-white p-8 text-gray-500 shadow-soft">
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
      <div className="rounded-lg bg-white p-8 text-gray-500 shadow-soft">
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
      {/* HEADER CARD */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Term</p>
          <p className="font-medium text-charcoal">
            {activeTerm.name} ({activeTerm.session})
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-gray-500">Average</p>
          <p className="font-playfair text-3xl font-semibold text-gold">
            {average.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* MOBILE CARDS (< md) */}
      <div className="space-y-3 md:hidden">
        {processedScores.map((s) => (
          <div
            key={s.subjectName}
            className="rounded-lg border border-gray-100 bg-white p-4 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium text-charcoal">{s.subjectName}</p>
              <span
                className={`rounded px-3 py-1 text-xs font-bold ${
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
              <div className="rounded bg-gray-50 p-2">
                <p className="mb-1 text-gray-500">CA1</p>
                <p className="font-semibold text-charcoal">{s.ca1}</p>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <p className="mb-1 text-gray-500">CA2</p>
                <p className="font-semibold text-charcoal">{s.ca2}</p>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <p className="mb-1 text-gray-500">CA3</p>
                <p className="font-semibold text-charcoal">{s.ca3}</p>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <p className="mb-1 text-gray-500">Exam</p>
                <p className="font-semibold text-charcoal">{s.exam}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">Total Score</span>
              <span className="font-semibold text-charcoal">{s.total}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE (>= md) */}
      <div className="hidden overflow-x-auto rounded-lg bg-white shadow-soft md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
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
          <tbody className="divide-y divide-gray-100">
            {processedScores.map((s) => (
              <tr key={s.subjectName} className="hover:bg-gray-50/70">
                <td className="p-4 font-medium text-charcoal">
                  {s.subjectName}
                </td>
                <td className="p-4">{s.ca1}</td>
                <td className="p-4">{s.ca2}</td>
                <td className="p-4">{s.ca3}</td>
                <td className="p-4">{s.exam}</td>
                <td className="p-4 font-semibold text-charcoal">{s.total}</td>
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
