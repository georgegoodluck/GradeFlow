import { auth } from "@/auth";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

async function addStaff(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const email = formData.get("email");
  const name = formData.get("name");
  const role = formData.get("role");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof password !== "string" ||
    (role !== "teacher" && role !== "admin")
  ) {
    return;
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (
    trimmedEmail.length === 0 ||
    trimmedName.length === 0 ||
    password.length < 6
  ) {
    return;
  }

  // Case-insensitive duplicate check against staff AND students
  const existingStaff = await db
    .select({ id: staff.id })
    .from(staff)
    .where(sql`lower(${staff.email}) = ${trimmedEmail}`)
    .limit(1);

  if (existingStaff.length > 0) return;

  const passwordHash = await hash(password, 12);

  await db.insert(staff).values({
    schoolId: session.user.schoolId,
    email: trimmedEmail,
    passwordHash,
    name: trimmedName,
    role,
  });

  revalidatePath("/dashboard/staff");
}

export default async function StaffPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const allStaff = await db
    .select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    })
    .from(staff)
    .where(eq(staff.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Staff</h2>

      <form
        action={addStaff}
        className="grid gap-3 rounded-lg bg-white p-6 shadow-soft"
      >
        <input
          name="name"
          placeholder="Full name"
          required
          className="rounded border p-3"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border p-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 chars)"
          required
          className="rounded border p-3"
        />
        <select name="role" className="rounded border p-3">
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="rounded bg-gold px-6 py-2 text-charcoal"
        >
          Add Staff
        </button>
      </form>

      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allStaff.map((s) => (
          <li key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-gray-500">{s.email}</p>
            </div>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs uppercase">
              {s.role}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
