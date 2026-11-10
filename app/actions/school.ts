"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";

export async function updateSchoolDetails(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const title = formData.get("headOfSchoolTitle");
  const name = formData.get("headOfSchoolName");

  if (typeof title !== "string" || typeof name !== "string") return;

  await db
    .update(schools)
    .set({ headOfSchoolTitle: title.trim(), headOfSchoolName: name.trim() })
    .where(eq(schools.id, session.user.schoolId));

  revalidatePath("/dashboard/settings");
}

export async function updateSchoolLogo(formData: FormData): Promise<void> {
  // ... (keep existing)
}

export async function removeSchoolLogo(): Promise<void> {
  // ... (keep existing)
}
