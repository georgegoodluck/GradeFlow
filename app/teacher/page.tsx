import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { teacherSubjects, subjects, classes } from "@/db/schema";

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-playfair text-3xl">My Assignments</h2>
        <p className="text-gray-500 text-sm">
          Select a class to begin entering scores.
        </p>
      </div>
      <Suspense fallback={<CardSkeleton />}>
        <AssignmentGrid />
      </Suspense>
    </div>
  );
}

async function AssignmentGrid() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  // Fetch only assignments for this specific teacher.
  // teacherSubjects.staffId references staff.id (UUID); session.user.id is
  // the staff row's id from the credentials authorize() return value, so
  // this is the correct join key.
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

  if (myAssignments.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-soft">
        You have not been assigned to any subjects yet. Please contact the
        school admin.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {myAssignments.map((assignment) => (
        <div
          key={assignment.id}
          className="rounded-lg bg-white p-6 shadow-soft transition hover:shadow-lg"
        >
          <h3 className="text-xl font-playfair text-charcoal">
            {assignment.subjectName}
          </h3>
          <p className="text-sm text-gray-500 mb-4">{assignment.className}</p>
          {/* This link will be active in Phase 4 */}
          <a
            href={`/teacher/scores?classId=${assignment.classId}&subjectId=${assignment.subjectId}`}
            className="inline-block rounded bg-gold px-4 py-2 text-sm font-medium text-charcoal hover:bg-[#d4b573] transition"
          >
            Enter Scores
          </a>
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}
