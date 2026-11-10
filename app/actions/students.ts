"use server";

import { hash } from "bcryptjs";
import { eq, sql, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { students } from "@/db/schema";

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

export async function addStudent(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = getString(formData, "name");
  const classId = getString(formData, "classId");
  if (!name || !classId)
    return { success: false, error: "Name and class are required." };

  // AUTO-GENERATE ADMISSION NUMBER
  const lastStudent = await db
    .select({ admissionNo: students.admissionNo })
    .from(students)
    .where(eq(students.schoolId, session.user.schoolId))
    .orderBy(desc(students.admissionNo))
    .limit(1);

  let nextAdmissionNo = "ADM001";
  if (lastStudent.length > 0) {
    const lastNo = lastStudent[0].admissionNo;
    const match = lastNo.match(/\d+$/);
    if (match) {
      const nextNum = parseInt(match[0], 10) + 1;
      nextAdmissionNo = `ADM${nextNum.toString().padStart(3, "0")}`;
    }
  }

  const email = `${nextAdmissionNo.toLowerCase()}@student.local`;
  const passwordHash = await hash("Password123", 12);

  await db.insert(students).values({
    schoolId: session.user.schoolId,
    classId,
    name: name.trim(),
    admissionNo: nextAdmissionNo,
    email,
    passwordHash,
  });

  revalidatePath("/dashboard/students");
  return { success: true };
}

export async function deleteStudent(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const id = getString(formData, "id");
  if (!id) return;

  await db
    .delete(students)
    .where(
      sql`${students.id} = ${id} AND ${students.schoolId} = ${session.user.schoolId}`,
    );

  revalidatePath("/dashboard/students");
}
