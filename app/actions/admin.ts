"use server";

import { hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, subjects, staff, schools, terms } from "@/db/schema";

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

// ONBOARDING ACTIONS

export async function saveSchoolName(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = getString(formData, "name");
  if (!name || name.trim().length === 0) {
    redirect("/onboarding/school?error=empty");
  }

  await db
    .update(schools)
    .set({ name: name.trim() })
    .where(eq(schools.id, session.user.schoolId));

  redirect("/onboarding/term");
}

export async function saveFirstTerm(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const termName = getString(formData, "name");
  const academicSession = getString(formData, "session");

  if (!termName || !academicSession) {
    redirect("/onboarding/term?error=empty");
  }

  await db.insert(terms).values({
    schoolId: session.user.schoolId,
    name: termName.trim(),
    session: academicSession,
    isActive: true,
  });

  redirect("/onboarding/classes");
}

export async function saveOnboardingClasses(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const raw = getString(formData, "classes");
  if (!raw || raw.trim().length === 0) {
    redirect("/onboarding/classes?error=empty");
  }

  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (names.length === 0) redirect("/onboarding/classes?error=empty");

  const existing = await db
    .select({ name: classes.name })
    .from(classes)
    .where(eq(classes.schoolId, session.user.schoolId));

  const existingLower = new Set(existing.map((c) => c.name.toLowerCase()));
  const unique = names.filter((n) => !existingLower.has(n.toLowerCase()));

  if (unique.length > 0) {
    await db.insert(classes).values(
      unique.map((name) => ({
        schoolId: session.user.schoolId!,
        name,
      })),
    );
  }

  await db
    .update(schools)
    .set({ onboardingComplete: true })
    .where(eq(schools.id, session.user.schoolId));

  redirect("/dashboard");
}

// ==========================================
// CLASS & SUBJECT CRUD
// ==========================================

export async function createClass(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = getString(formData, "name");
  if (!name || name.trim().length === 0) return;

  const trimmed = name.trim();

  const existing = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      sql`${classes.schoolId} = ${session.user.schoolId} AND lower(${classes.name}) = lower(${trimmed})`,
    )
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(classes).values({
    schoolId: session.user.schoolId,
    name: trimmed,
  });

  revalidatePath("/dashboard/classes");
}

export async function deleteClass(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const id = getString(formData, "id");
  if (!id) return;

  await db
    .delete(classes)
    .where(
      sql`${classes.id} = ${id} AND ${classes.schoolId} = ${session.user.schoolId}`,
    );

  revalidatePath("/dashboard/classes");
}

export async function createSubject(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = getString(formData, "name");
  if (!name || name.trim().length === 0) return;

  const trimmed = name.trim();

  const existing = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(
      sql`${subjects.schoolId} = ${session.user.schoolId} AND lower(${subjects.name}) = lower(${trimmed})`,
    )
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(subjects).values({
    schoolId: session.user.schoolId,
    name: trimmed,
  });

  revalidatePath("/dashboard/subjects");
}

export async function deleteSubject(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const id = getString(formData, "id");
  if (!id) return;

  await db
    .delete(subjects)
    .where(
      sql`${subjects.id} = ${id} AND ${subjects.schoolId} = ${session.user.schoolId}`,
    );

  revalidatePath("/dashboard/subjects");
}

// ==========================================
// STAFF MANAGEMENT (Auto-generated password)
// ==========================================

export async function addStaffMember(
  formData: FormData,
): Promise<{ success: boolean; generatedPassword?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const email = getString(formData, "email");
  const name = getString(formData, "name");
  const role = getString(formData, "role");

  if (!email || !name || (role !== "teacher" && role !== "admin")) {
    return { success: false, error: "Missing required fields." };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (trimmedEmail.length === 0 || trimmedName.length === 0) {
    return { success: false, error: "Invalid input." };
  }

  const existingStaff = await db
    .select({ id: staff.id })
    .from(staff)
    .where(sql`lower(${staff.email}) = ${trimmedEmail}`)
    .limit(1);

  if (existingStaff.length > 0) {
    return { success: false, error: "Email already exists." };
  }

  // Generate a secure, random 8-character password
  const generatedPassword = randomBytes(4).toString("hex");
  const passwordHash = await hash(generatedPassword, 12);

  await db.insert(staff).values({
    schoolId: session.user.schoolId,
    email: trimmedEmail,
    passwordHash,
    name: trimmedName,
    role,
  });

  revalidatePath("/dashboard/staff");

  return { success: true, generatedPassword };
}

export async function createTerm(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = getString(formData, "name");
  const academicSession = getString(formData, "session");

  if (!name || !academicSession) return;

  await db.insert(terms).values({
    schoolId: session.user.schoolId,
    name: name.trim(),
    session: academicSession,
    isActive: false,
  });

  revalidatePath("/dashboard/terms");
}

export async function setActiveTerm(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const id = getString(formData, "id");
  if (!id) return;

  // Deactivate all terms for this school
  await db
    .update(terms)
    .set({ isActive: false })
    .where(eq(terms.schoolId, session.user.schoolId));

  // Activate the selected term
  await db
    .update(terms)
    .set({ isActive: true })
    .where(
      sql`${terms.id} = ${id} AND ${terms.schoolId} = ${session.user.schoolId}`,
    );

  revalidatePath("/dashboard/terms");
  revalidatePath("/teacher/scores"); // Refresh teacher score entry
}
