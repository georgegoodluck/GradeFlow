import { auth } from "@/auth";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createSubject(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) return;

  const trimmed = name.trim();

  const existing = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(
      sql`${subjects.schoolId} = ${session.user.schoolId} AND lower(${subjects.name}) = lower(${trimmed})`,
    )
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(subjects).values({
    schoolId: session.user.schoolId,
    name: trimmed,
  });

  revalidatePath("/dashboard/subjects");
}

async function deleteSubject(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await db
    .delete(subjects)
    .where(
      sql`${subjects.id} = ${id} AND ${subjects.schoolId} = ${session.user.schoolId}`,
    );

  revalidatePath("/dashboard/subjects");
}

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const allSubjects = await db
    .select()
    .from(subjects)
    .where(eq(subjects.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Subjects</h2>

      <form action={createSubject} className="flex gap-3">
        <input
          name="name"
          placeholder="Subject name (e.g. Mathematics)"
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
        {allSubjects.map((subj) => (
          <li key={subj.id} className="flex items-center justify-between p-4">
            <span>{subj.name}</span>
            <form action={deleteSubject}>
              <input type="hidden" name="id" value={subj.id} />
              <button type="submit" className="text-sm text-red-500">
                Delete
              </button>
            </form>
          </li>
        ))}
        {allSubjects.length === 0 && (
          <li className="p-4 text-gray-500">No subjects yet.</li>
        )}
      </ul>
    </div>
  );
}
