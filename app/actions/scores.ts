"use server";

import { eq, and, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { authDb } from "@/db";
import { scores, teacherSubjects, terms, students, staff } from "@/db/schema";

// Single source of truth for score limits
const MAX_SCORES = { ca1: 40, ca2: 40, ca3: 40, exam: 60 } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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

  // 1. Resolve real staff ID
  const [staffRecord] = await authDb
    .select({ id: staff.id })
    .from(staff)
    .where(
      and(
        eq(staff.schoolId, session.user.schoolId),
        eq(staff.email, session.user.email!),
      ),
    )
    .limit(1);

  if (!staffRecord) {
    return { success: false, error: "Staff record not found." };
  }

  // 2. Verify assignment
  const assignment = await authDb
    .select({ id: teacherSubjects.id })
    .from(teacherSubjects)
    .where(
      and(
        eq(teacherSubjects.schoolId, session.user.schoolId),
        eq(teacherSubjects.staffId, staffRecord.id),
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

  // 3. Verify active term (also scope to school!)
  const [activeTerm] = await authDb
    .select({ id: terms.id })
    .from(terms)
    .where(
      and(
        eq(terms.id, termId),
        eq(terms.schoolId, session.user.schoolId), // 👈 scope to school
        eq(terms.isActive, true),
      ),
    )
    .limit(1);

  if (!activeTerm) {
    return { success: false, error: "This term is not active." };
  }

  // 4. Extract AND clamp scores server-side
  const studentsToUpdate: {
    studentId: string;
    ca1: number;
    ca2: number;
    ca3: number;
    exam: number;
    remark: string | null;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("ca1_") && typeof value === "string") {
      const studentId = key.replace("ca1_", "");

      const ca1 = clamp(parseFloat(value) || 0, 0, MAX_SCORES.ca1);
      const ca2 = clamp(
        parseFloat(formData.get(`ca2_${studentId}`) as string) || 0,
        0,
        MAX_SCORES.ca2,
      );
      const ca3 = clamp(
        parseFloat(formData.get(`ca3_${studentId}`) as string) || 0,
        0,
        MAX_SCORES.ca3,
      );
      const exam = clamp(
        parseFloat(formData.get(`exam_${studentId}`) as string) || 0,
        0,
        MAX_SCORES.exam,
      );

      const rawRemark = formData.get(`remark_${studentId}`);
      const remark =
        typeof rawRemark === "string" && rawRemark.trim().length > 0
          ? rawRemark.trim()
          : null;

      studentsToUpdate.push({ studentId, ca1, ca2, ca3, exam, remark });
    }
  }

  if (studentsToUpdate.length === 0) {
    return { success: true };
  }

  // 5. Defense-in-depth: verify every studentId belongs to this school AND class
  //    (prevents a malicious client from submitting scores for other schools/classes)
  const studentIds = studentsToUpdate.map((s) => s.studentId);
  const validStudents = await authDb
    .select({ id: students.id })
    .from(students)
    .where(
      and(
        eq(students.schoolId, session.user.schoolId),
        eq(students.classId, classId),
        inArray(students.id, studentIds),
      ),
    );

  const validStudentIds = new Set(validStudents.map((s) => s.id));

  // 6. Upsert (in a transaction so partial failures don't leave half-saved data)
  await authDb.transaction(async (tx) => {
    for (const studentData of studentsToUpdate) {
      // Skip any student that failed the ownership check
      if (!validStudentIds.has(studentData.studentId)) continue;

      const { studentId, ca1, ca2, ca3, exam, remark } = studentData;

      const existing = await tx
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
        await tx
          .update(scores)
          .set({ ca1, ca2, ca3, exam, remark })
          .where(eq(scores.id, existing[0].id));
      } else {
        await tx.insert(scores).values({
          schoolId: session.user.schoolId,
          studentId,
          subjectId,
          termId,
          ca1,
          ca2,
          ca3,
          exam,
          remark,
        });
      }
    }
  });

  revalidatePath("/teacher/scores");
  return { success: true };
}
