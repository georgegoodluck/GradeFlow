"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { authDb } from "@/db";
import { schools, staff } from "@/db/schema";
import { generateSchoolCode } from "@/lib/school-code";

// ==========================================
// LOGIN
// ==========================================
export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const schoolCode = formData.get("schoolCode");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof schoolCode !== "string"
  ) {
    redirect("/login?error=invalid");
  }

  try {
    await signIn("credentials", {
      email: email.trim(),
      password,
      schoolCode: schoolCode.trim().toUpperCase(),
      redirectTo: "/dashboard",
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      redirect(
        `/login?error=${error.type}&schoolCode=${encodeURIComponent(schoolCode)}`,
      );
    }
    throw error;
  }
}

// ==========================================
// REGISTER OWNER
// ==========================================
export async function registerOwner(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const schoolName = formData.get("schoolName");
  const motto = formData.get("motto");
  const headOfSchoolTitle = formData.get("headOfSchoolTitle");
  const headOfSchoolName = formData.get("headOfSchoolName");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof schoolName !== "string" ||
    typeof motto !== "string" ||
    typeof headOfSchoolTitle !== "string" ||
    typeof headOfSchoolName !== "string"
  ) {
    redirect("/register?error=invalid");
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedSchool = schoolName.trim();

  if (
    trimmedEmail.length === 0 ||
    trimmedSchool.length === 0 ||
    password.length < 6
  ) {
    redirect("/register?error=invalid");
  }

  const existing = await authDb
    .select({ id: staff.id })
    .from(staff)
    .where(eq(staff.email, trimmedEmail))
    .limit(1);

  if (existing.length > 0) redirect("/register?error=exists");

  // Generate unique school code
  let finalCode = generateSchoolCode(trimmedSchool);
  let attempts = 0;
  while (attempts < 5) {
    const codeExists = await authDb
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.code, finalCode))
      .limit(1);
    if (codeExists.length === 0) break;
    finalCode = generateSchoolCode(trimmedSchool);
    attempts++;
  }

  if (attempts >= 5) redirect("/register?error=code_failed");

  const passwordHash = await hash(password, 12);

  const [school] = await authDb
    .insert(schools)
    .values({
      name: trimmedSchool,
      code: finalCode,
      motto: motto.trim(),
      headOfSchoolTitle: headOfSchoolTitle.trim(),
      headOfSchoolName: headOfSchoolName.trim(),
    })
    .returning({ id: schools.id, code: schools.code });

  // Use the email prefix as the fallback owner name
  const fallbackName = trimmedEmail.split("@")[0];

  await authDb.insert(staff).values({
    schoolId: school.id,
    email: trimmedEmail,
    passwordHash,
    name: fallbackName,
    role: "owner",
  });

  redirect(`/login?schoolCode=${encodeURIComponent(school.code)}&registered=1`);
}

// ==========================================
// PASSWORD RESET (Placeholders)
// ==========================================
export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = formData.get("email");
  if (typeof email !== "string") redirect("/login?error=invalid");
  redirect("/login?reset_sent=1");
}

export async function resetPassword(formData: FormData): Promise<void> {
  redirect("/login?reset_success=1");
}
