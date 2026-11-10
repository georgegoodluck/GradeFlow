"use server";

import { hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { students } from "@/db/schema";

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

export async function addStudent(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = getString(formData, "name");
  const admissionNo = getString(formData, "admissionNo");
  const classId = getString(formData, "classId");

  if (!name || !admissionNo || !classId) return;

  const trimmedName = name.trim();
  const trimmedAdmission = admissionNo.trim();

  // 1. Check for duplicate admission number in this school
  const existing = await db
    .select({ id: students.id })
    .from(students)
    .where(
      sql`${students.schoolId} = ${session.user.schoolId} AND lower(${students.admissionNo}) = lower(${trimmedAdmission})`,
    )
    .limit(1);

  if (existing.length > 0) return; // Silently fail or handle UI error

  // 2. Generate credentials
  const email = `${trimmedAdmission.toLowerCase()}@student.local`;
  const defaultPassword = "Password123"; // In production, prompt the admin to set this
  const passwordHash = await hash(defaultPassword, 12);

  // 3. Insert
  await db.insert(students).values({
    schoolId: session.user.schoolId,
    classId,
    name: trimmedName,
    admissionNo: trimmedAdmission,
    email,
    passwordHash,
  });

  revalidatePath("/dashboard/students");
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
