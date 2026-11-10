import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { students, classes, terms } from "@/db/schema";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-semibold text-charcoal">
          Generate Reports
        </h2>
        <p className="text-sm text-gray-500">
          Select a student and term to view or download a PDF report card.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <ReportGenerator />
      </Suspense>
    </div>
  );
}

async function ReportGenerator() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const [allStudents, allTerms] = await Promise.all([
    db
      .select({
        id: students.id,
        name: students.name,
        admissionNo: students.admissionNo,
        className: classes.name,
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.schoolId, session.user.schoolId)),
    db.select().from(terms).where(eq(terms.schoolId, session.user.schoolId)),
  ]);

  if (allStudents.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500 shadow-soft">
        No students registered yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allStudents.map((student) => (
        <div
          key={student.id}
          className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-5 shadow-soft transition-colors hover:border-gray-200 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="font-medium text-charcoal">{student.name}</p>
            <p className="text-xs text-gray-500">
              {student.admissionNo} • {student.className ?? "No class"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTerms.length === 0 && (
              <span className="text-xs text-gray-400">No terms available</span>
            )}
            {allTerms.map((term) => (
              <a
                key={term.id}
                href={`/api/reports/${student.id}/${term.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded border border-gold px-4 py-2.5 text-center text-xs font-medium text-gold transition hover:bg-gold hover:text-charcoal sm:flex-none"
              >
                {term.name}
                <span className="block text-[10px] font-normal opacity-75">
                  {term.session}
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-20 w-full animate-pulse rounded-lg bg-gray-200"
        />
      ))}
    </div>
  );
}
