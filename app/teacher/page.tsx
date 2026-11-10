// app/teacher/page.tsx
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { teacherSubjects, subjects, classes } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const session = await auth();

  if (!session?.user?.schoolId || !session?.user?.id) {
    return (
      <div className="p-8 text-center text-red-500">
        Session error. Please log in again.
      </div>
    );
  }

  const myAssignments = await db
    .select({
      id: teacherSubjects.id,
      subjectName: subjects.name,
      className: classes.name,
      classId: classes.id,
      subjectId: subjects.id,
    })
    .from(teacherSubjects)
    .innerJoin(subjects, eq(teacherSubjects.subjectId, subjects.id))
    .innerJoin(classes, eq(teacherSubjects.classId, classes.id))
    .where(
      and(
        eq(teacherSubjects.schoolId, session.user.schoolId),
        eq(teacherSubjects.staffId, session.user.id),
      ),
    );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-playfair text-3xl">My Assignments</h2>
        <p className="text-gray-500 text-sm">
          Select a class to begin entering scores.
        </p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-soft">
          You have not been assigned to any subjects yet. Please contact the
          school admin.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-lg bg-white p-6 shadow-soft transition hover:shadow-lg"
            >
              <h3 className="text-xl font-playfair text-charcoal">
                {assignment.subjectName}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {assignment.className}
              </p>
              <a
                href={`/teacher/scores?classId=${assignment.classId}&subjectId=${assignment.subjectId}`}
                className="inline-block rounded bg-gold px-4 py-2 text-sm font-medium text-charcoal hover:bg-[#d4b573] transition"
              >
                Enter Scores
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
