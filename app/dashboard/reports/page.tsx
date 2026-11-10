import { eq } from "drizzle-orm";
import { FileText, Download } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { students, classes, terms, subjects } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.schoolId)
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;

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
      <h2 className="font-playfair text-3xl">Generate Reports</h2>
      <div className="space-y-4">
        {allStudents.length === 0 && (
          <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-soft">
            No students registered yet.
          </div>
        )}
        {allStudents.map((student) => (
          <div
            key={student.id}
            className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium text-charcoal">{student.name}</p>
              <p className="text-sm text-gray-500">
                {student.admissionNo} • {student.className ?? "No class"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTerms.length === 0 && (
                <span className="text-xs text-gray-400">No terms created.</span>
              )}
              {allTerms.map((term) => (
                <a
                  key={term.id}
                  href={`/api/reports/${student.id}/${term.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 flex-1 rounded border border-gold px-4 py-3 text-center text-xs font-medium text-gold transition hover:bg-gold hover:text-charcoal sm:flex-none md:py-2"
                >
                  <FileText className="h-3 w-3" />
                  {term.name} ({term.session})
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
