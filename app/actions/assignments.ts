"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { teacherSubjects } from "@/db/schema";

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

export async function assignTeacher(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const staffId = getString(formData, "staffId");
  const subjectId = getString(formData, "subjectId");
  const classId = getString(formData, "classId");

  if (!staffId || !subjectId || !classId) return;

  // Check for duplicate assignment
  const existing = await db
    .select({ id: teacherSubjects.id })
    .from(teacherSubjects)
    .where(
      sql`${teacherSubjects.schoolId} = ${session.user.schoolId} 
          AND ${teacherSubjects.staffId} = ${staffId} 
          AND ${teacherSubjects.subjectId} = ${subjectId} 
          AND ${teacherSubjects.classId} = ${classId}`,
    )
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(teacherSubjects).values({
    schoolId: session.user.schoolId,
    staffId,
    subjectId,
    classId,
  });

  revalidatePath("/dashboard/assignments");
}

export async function removeAssignment(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const id = getString(formData, "id");
  if (!id) return;

  await db
    .delete(teacherSubjects)
    .where(
      sql`${teacherSubjects.id} = ${id} AND ${teacherSubjects.schoolId} = ${session.user.schoolId}`,
    );

  revalidatePath("/dashboard/assignments");
}
