import { eq } from "drizzle-orm";
import { Plus, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { createSubject, deleteSubject } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user?.schoolId) return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  const allSubjects = await db.select().from(subjects).where(eq(subjects.schoolId, session.user.schoolId));
  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <h2 className="font-playfair text-3xl">Subjects</h2>
      <form action={createSubject} className="flex flex-col gap-3 sm:flex-row">
        <input name="name" placeholder="Subject name (e.g. Mathematics)" required className="flex-1 rounded border p-3" />
        <button type="submit" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-gold px-6 py-3 text-charcoal sm:w-auto sm:py-2">
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </form>
      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allSubjects.map((subj) => (
          <li key={subj.id} className="flex items-center justify-between gap-3 p-4">
            <span className="min-w-0 flex-1 break-words font-medium">{subj.name}</span>
            <form action={deleteSubject} className="shrink-0">
              <input type="hidden" name="id" value={subj.id} />
              <button type="submit" className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Delete</span>
              </button>
            </form>
          </li>
        ))}
        {allSubjects.length === 0 && <li className="p-4 text-center text-gray-500">No subjects yet.</li>}
      </ul>
    </div>
  );
}
