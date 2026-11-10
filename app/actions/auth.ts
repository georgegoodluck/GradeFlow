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
// LOGIN (tenant-aware)
// ==========================================

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const schoolSlug = formData.get("schoolSlug");

  // Determine where to send the user back on error
  const errorRedirectPath =
    typeof schoolSlug === "string" && schoolSlug.trim() !== ""
      ? `/${schoolSlug.trim()}/login?error=invalid`
      : `/login?error=invalid`;

  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password.trim() === "" ||
    typeof schoolSlug !== "string" ||
    schoolSlug.trim() === ""
  ) {
    redirect(errorRedirectPath);
  }

  try {
    await signIn("credentials", {
      email: email.trim(),
      password,
      schoolSlug: schoolSlug.trim(),
      redirectTo: "/dashboard",
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      redirect(`/${schoolSlug.trim()}/login?error=${error.type}`);
    }
    throw error;
  }
}

// ==========================================
// REGISTER (owner self-signup)
// ==========================================

export async function registerOwner(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  const schoolName = formData.get("schoolName");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof schoolName !== "string"
  ) {
    redirect("/register?error=invalid");
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const trimmedSchool = schoolName.trim();

  if (
    trimmedEmail.length === 0 ||
    trimmedName.length === 0 ||
    trimmedSchool.length === 0 ||
    password.length < 6
  ) {
    redirect("/register?error=invalid");
  }

  // 1. Check for existing staff email
  const existing = await authDb
    .select({ id: staff.id })
    .from(staff)
    .where(eq(staff.email, trimmedEmail))
    .limit(1);

  if (existing.length > 0) {
    redirect("/register?error=exists");
  }

  // 2. Generate unique school code with retry logic
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

  if (attempts >= 5) {
    redirect("/register?error=code_failed");
  }

  // 3. Hash password
  const passwordHash = await hash(password, 12);

  // 4. Create school + owner
  const [school] = await authDb
    .insert(schools)
    .values({ name: trimmedSchool, code: finalCode })
    .returning({ id: schools.id, code: schools.code });

  await authDb.insert(staff).values({
    schoolId: school.id,
    email: trimmedEmail,
    passwordHash,
    name: trimmedName,
    role: "owner",
  });

  // 5. Redirect to login with the code pre-filled
  redirect(`/login?schoolCode=${school.code}`);
}
