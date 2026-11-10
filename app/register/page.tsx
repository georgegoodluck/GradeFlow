import { hash } from "bcryptjs";
import { db } from "@/db";
import { staff, schools } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

async function register(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const schoolName = formData.get("schoolName") as string;

  // Check duplicate email
  const existing = await db
    .select()
    .from(staff)
    .where(eq(staff.email, email))
    .limit(1);
  if (existing.length > 0) {
    redirect("/register?error=exists");
  }

  const passwordHash = await hash(password, 12);
  const [school] = await db
    .insert(schools)
    .values({ name: schoolName })
    .returning();

  await db.insert(staff).values({
    schoolId: school.id,
    email,
    passwordHash,
    name,
    role: "owner",
  });

  redirect("/login");
}
