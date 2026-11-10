import { eq } from "drizzle-orm";
import { Plus, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { createSubject, deleteSubject } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user?.schoolId)
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  const allSubjects = await db
    .select()
    .from(subjects)
    .where(eq(subjects.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Subjects</h2>
      <form action={createSubject} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          placeholder="Subject name (e.g. Mathematics)"
          required
          className="flex-1 rounded border p-3"
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded bg-gold px-6 py-2 text-charcoal sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </form>
      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allSubjects.map((subj) => (
          <li
            key={subj.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <span className="min-w-0 truncate">{subj.name}</span>
            <form action={deleteSubject} className="shrink-0">
              <input type="hidden" name="id" value={subj.id} />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-500 transition hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" /> Delete
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
