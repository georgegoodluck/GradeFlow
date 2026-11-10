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
      <h2 className="font-playfair text-3xl">Generate Reports</h2>
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

  const allStudents = await db
    .select({
      id: students.id,
      name: students.name,
      admissionNo: students.admissionNo,
      className: classes.name,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(eq(students.schoolId, session.user.schoolId));

  const allTerms = await db
    .select()
    .from(terms)
    .where(eq(terms.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-soft">
        <p className="text-sm text-gray-500 mb-4">
          Select a student and term to generate a PDF report card.
        </p>
        <div className="space-y-4">
          {allStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between border-b pb-3"
            >
              <div>
                <p className="font-medium">
                  {student.name} ({student.admissionNo})
                </p>
                <p className="text-sm text-gray-500">
                  {student.className ?? "No class"}
                </p>
              </div>
              <div className="flex gap-3">
                {allTerms.map((term) => (
                  <a
                    key={term.id}
                    href={`/api/reports/${student.id}/${term.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-gold px-4 py-2 text-xs text-gold hover:bg-gold hover:text-charcoal transition"
                  >
                    {term.name} ({term.session})
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
