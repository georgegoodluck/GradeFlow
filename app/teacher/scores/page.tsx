import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { students, scores, terms, subjects, classes } from "@/db/schema";
import { ScoreEntryForm } from "./ScoreEntryForm";

export default function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string }>;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Enter Scores</h2>
      <Suspense fallback={<TableSkeleton />}>
        <ScoreEntryWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ScoreEntryWrapper({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string }>;
}) {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const params = await searchParams;
  const classId = params.classId;
  const subjectId = params.subjectId;

  if (!classId || !subjectId) {
    return (
      <div className="rounded bg-white p-6 text-red-500">
        Invalid class or subject selected.
      </div>
    );
  }

  // Fetch active term
  const [activeTerm] = await db
    .select()
    .from(terms)
    .where(
      and(eq(terms.schoolId, session.user.schoolId), eq(terms.isActive, true)),
    )
    .limit(1);

  if (!activeTerm) {
    return (
      <div className="rounded bg-white p-6 text-red-500">
        No active term found. Please contact the administrator.
      </div>
    );
  }

  // Fetch class and subject names for display
  const [currentClass] = await db
    .select()
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);
  const [currentSubject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.id, subjectId))
    .limit(1);

  // Fetch students in the class
  const studentList = await db
    .select()
    .from(students)
    .where(
      and(
        eq(students.schoolId, session.user.schoolId),
        eq(students.classId, classId),
      ),
    );

  if (studentList.length === 0) {
    return (
      <div className="rounded bg-white p-6 text-gray-500">
        No students in this class yet.
      </div>
    );
  }

  // Fetch existing scores for these students in this subject/term
  const studentIds = studentList.map((s) => s.id);
  const existingScores = await db
    .select()
    .from(scores)
    .where(
      and(
        eq(scores.schoolId, session.user.schoolId),
        eq(scores.subjectId, subjectId),
        eq(scores.termId, activeTerm.id),
        inArray(scores.studentId, studentIds),
      ),
    );

  // Map scores by student ID for quick lookup
  const scoreMap = new Map(existingScores.map((s) => [s.studentId, s]));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-soft">
        <div>
          <p className="text-sm text-gray-500">Class</p>
          <p className="font-medium">{currentClass?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Subject</p>
          <p className="font-medium">{currentSubject?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Active Term</p>
          <p className="font-medium text-gold">{activeTerm.name}</p>
        </div>
      </div>

      <ScoreEntryForm
        classId={classId}
        subjectId={subjectId}
        termId={activeTerm.id}
        students={studentList}
        existingScores={scoreMap}
      />
    </div>
  );
}

function TableSkeleton() {
  return <div className="h-96 w-full animate-pulse rounded-lg bg-gray-200" />;
}
