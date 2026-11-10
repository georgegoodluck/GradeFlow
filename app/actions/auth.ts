"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { authDb } from "@/db";
import { schools, staff } from "@/db/schema";

// ==========================================
// LOGIN (tenant-aware)
// ==========================================

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const schoolSlug = formData.get("schoolSlug");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof schoolSlug !== "string"
  ) {
    redirect(`/${schoolSlug ?? ""}/login?error=invalid`);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      schoolSlug,
      redirectTo: "/dashboard",
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      redirect(`/${schoolSlug}/login?error=${error.type}`);
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

  // 2. Generate slug
  const baseSlug = trimmedSchool
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const slugExists = await authDb
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.slug, baseSlug))
    .limit(1);

  const finalSlug =
    slugExists.length > 0
      ? `${baseSlug}-${Math.floor(Math.random() * 10000)}`
      : baseSlug;

  // 3. Hash password
  const passwordHash = await hash(password, 12);

  // 4. Create school + owner
  const [school] = await authDb
    .insert(schools)
    .values({ name: trimmedSchool, slug: finalSlug })
    .returning({ id: schools.id, slug: schools.slug });

  await authDb.insert(staff).values({
    schoolId: school.id,
    email: trimmedEmail,
    passwordHash,
    name: trimmedName,
    role: "owner",
  });

  // 5. Redirect to the branded login
  redirect(`/${school.slug}/login?registered=1`);
}
