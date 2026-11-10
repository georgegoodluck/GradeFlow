"use server";

import { eq, and, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { scores, teacherSubjects, terms, students } from "@/db/schema";

export async function submitScores(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const classId = formData.get("classId");
  const subjectId = formData.get("subjectId");
  const termId = formData.get("termId");

  if (
    typeof classId !== "string" ||
    typeof subjectId !== "string" ||
    typeof termId !== "string"
  ) {
    return { success: false, error: "Invalid request data." };
  }

  // 1. Verify the teacher is assigned to this subject/class
  const assignment = await db
    .select({ id: teacherSubjects.id })
    .from(teacherSubjects)
    .where(
      and(
        eq(teacherSubjects.schoolId, session.user.schoolId),
        eq(teacherSubjects.staffId, session.user.id),
        eq(teacherSubjects.subjectId, subjectId),
        eq(teacherSubjects.classId, classId),
      ),
    )
    .limit(1);

  if (assignment.length === 0) {
    return {
      success: false,
      error: "You are not authorized to enter scores for this class/subject.",
    };
  }

  // 2. Verify the term is active
  const [activeTerm] = await db
    .select({ id: terms.id })
    .from(terms)
    .where(and(eq(terms.id, termId), eq(terms.isActive, true)))
    .limit(1);

  if (!activeTerm) {
    return { success: false, error: "This term is not active." };
  }

  // 3. Extract student data from FormData
  const studentsToUpdate: {
    studentId: string;
    ca1: number;
    ca2: number;
    ca3: number;
    exam: number;
  }[] = [];

  // Form inputs will be named like `ca1_${studentId}`, `exam_${studentId}`, etc.
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("ca1_") && typeof value === "string") {
      const studentId = key.replace("ca1_", "");
      const ca1 = parseFloat(value) || 0;
      const ca2 = parseFloat(formData.get(`ca2_${studentId}`) as string) || 0;
      const ca3 = parseFloat(formData.get(`ca3_${studentId}`) as string) || 0;
      const exam = parseFloat(formData.get(`exam_${studentId}`) as string) || 0;

      studentsToUpdate.push({ studentId, ca1, ca2, ca3, exam });
    }
  }

  if (studentsToUpdate.length === 0) {
    return { success: true }; // Nothing to update
  }

  // 4. Upsert scores
  for (const studentData of studentsToUpdate) {
    const { studentId, ca1, ca2, ca3, exam } = studentData;

    // Check if score already exists
    const existing = await db
      .select({ id: scores.id })
      .from(scores)
      .where(
        and(
          eq(scores.schoolId, session.user.schoolId),
          eq(scores.studentId, studentId),
          eq(scores.subjectId, subjectId),
          eq(scores.termId, termId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(scores)
        .set({ ca1, ca2, ca3, exam })
        .where(eq(scores.id, existing[0].id));
    } else {
      // Insert
      await db.insert(scores).values({
        schoolId: session.user.schoolId,
        studentId,
        subjectId,
        termId,
        ca1,
        ca2,
        ca3,
        exam,
      });
    }
  }

  revalidatePath("/teacher/scores");
  return { success: true };
}
