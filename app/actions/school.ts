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
  const motto = formData.get("motto");

  if (
    typeof title !== "string" ||
    typeof name !== "string" ||
    typeof motto !== "string"
  )
    return;

  await db
    .update(schools)
    .set({
      headOfSchoolTitle: title.trim(),
      headOfSchoolName: name.trim(),
      motto: motto.trim(),
    })
    .where(eq(schools.id, session.user.schoolId));

  revalidatePath("/dashboard/settings");
}

export async function updateSchoolLogo(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return;

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await db
    .update(schools)
    .set({ logoUrl: dataUrl })
    .where(eq(schools.id, session.user.schoolId));

  revalidatePath("/dashboard/settings");
}

export async function removeSchoolLogo(): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  await db
    .update(schools)
    .set({ logoUrl: null })
    .where(eq(schools.id, session.user.schoolId));

  revalidatePath("/dashboard/settings");
}
