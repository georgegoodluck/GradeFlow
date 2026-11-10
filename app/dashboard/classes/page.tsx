import { auth } from "@/auth";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createClass(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) return;

  const trimmed = name.trim();

  // Case-insensitive duplicate check
  const existing = await db
    .select({ id: classes.id })
    .from(classes)
    .where(
      sql`${classes.schoolId} = ${session.user.schoolId} AND lower(${classes.name}) = lower(${trimmed})`,
    )
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(classes).values({
    schoolId: session.user.schoolId,
    name: trimmed,
  });

  revalidatePath("/dashboard/classes");
}

async function deleteClass(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await db
    .delete(classes)
    .where(
      sql`${classes.id} = ${id} AND ${classes.schoolId} = ${session.user.schoolId}`,
    );

  revalidatePath("/dashboard/classes");
}

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const allClasses = await db
    .select()
    .from(classes)
    .where(eq(classes.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Classes</h2>

      <form action={createClass} className="flex gap-3">
        <input
          name="name"
          placeholder="Class name (e.g. JSS1)"
          required
          className="flex-1 rounded border p-3"
        />
        <button
          type="submit"
          className="rounded bg-gold px-6 py-2 text-charcoal"
        >
          Add
        </button>
      </form>

      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allClasses.map((cls) => (
          <li key={cls.id} className="flex items-center justify-between p-4">
            <span>{cls.name}</span>
            <form action={deleteClass}>
              <input type="hidden" name="id" value={cls.id} />
              <button type="submit" className="text-sm text-red-500">
                Delete
              </button>
            </form>
          </li>
        ))}
        {allClasses.length === 0 && (
          <li className="p-4 text-gray-500">No classes yet.</li>
        )}
      </ul>
    </div>
  );
}
