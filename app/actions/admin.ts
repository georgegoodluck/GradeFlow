"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";

// Helper: extract string from FormData safely
function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

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

  // Check for existing staff
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

  // Return the plaintext password to show to the admin ONCE
  return { success: true, generatedPassword };
}
