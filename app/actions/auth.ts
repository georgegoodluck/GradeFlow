"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { authDb } from "@/db";
import { schools, staff } from "@/db/schema";

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=invalid");
  }

  try {
    await signIn("credentials", {
      email: email.trim(),
      password,
      redirectTo: "/dashboard",
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      redirect(`/login?error=${error.type}`);
    }
    throw error;
  }
}

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
  )
    redirect("/register?error=invalid");

  const existing = await authDb
    .select({ id: staff.id })
    .from(staff)
    .where(eq(staff.email, trimmedEmail))
    .limit(1);
  if (existing.length > 0) redirect("/register?error=exists");

  const passwordHash = await hash(password, 12);

  const [school] = await authDb
    .insert(schools)
    .values({
      name: trimmedSchool,
      motto: motto.trim(),
      headOfSchoolTitle: headOfSchoolTitle.trim(),
      headOfSchoolName: headOfSchoolName.trim(),
    })
    .returning({ id: schools.id });

  await authDb.insert(staff).values({
    schoolId: school.id,
    email: trimmedEmail,
    passwordHash,
    plainPassword: password, // Store for owner visibility
    name: trimmedEmail.split("@")[0],
    role: "owner",
  });

  redirect(`/login?registered=1`);
}
