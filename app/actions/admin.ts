"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { terms } from "@/db/schema";

export async function createNextTerm(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const academicSession = formData.get("session");
  if (typeof academicSession !== "string") return;

  // Check what terms already exist for this session
  const existing = await db
    .select({ name: terms.name })
    .from(terms)
    .where(
      sql`${terms.schoolId} = ${session.user.schoolId} AND ${terms.session} = ${academicSession}`,
    );

  const existingNames = new Set(existing.map((t) => t.name.toLowerCase()));

  let nextTermName = "";
  if (!existingNames.has("first term")) nextTermName = "First Term";
  else if (!existingNames.has("second term")) nextTermName = "Second Term";
  else if (!existingNames.has("third term")) nextTermName = "Third Term";
  else {
    // All three exist. Prompt them to change session or delete.
    return;
  }

  await db.insert(terms).values({
    schoolId: session.user.schoolId,
    name: nextTermName,
    session: academicSession,
    isActive: false,
  });

  revalidatePath("/dashboard/terms");
}
