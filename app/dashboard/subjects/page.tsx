import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { Plus, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { createSubject, deleteSubject } from "@/app/actions/admin";

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Subjects</h2>
      <Suspense fallback={<TableSkeleton />}>
        <SubjectList />
      </Suspense>
    </div>
  );
}

async function SubjectList() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const allSubjects = await db
    .select()
    .from(subjects)
    .where(eq(subjects.schoolId, session.user.schoolId));

  return (
    <>
      <form action={createSubject} className="flex gap-3">
        <input
          name="name"
          placeholder="Subject name (e.g. Mathematics)"
          required
          className="flex-1 rounded border p-3"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded bg-gold px-6 py-2 text-charcoal"
        >
          <Plus className="h-4 w-4" /> Add Subject
        </button>
      </form>

      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allSubjects.map((subj) => (
          <li key={subj.id} className="flex items-center justify-between p-4">
            <span>{subj.name}</span>
            <form action={deleteSubject}>
              <input type="hidden" name="id" value={subj.id} />
              <button
                type="submit"
                className="p-2 text-red-500 transition hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </li>
        ))}
        {allSubjects.length === 0 && (
          <li className="p-4 text-gray-500">No subjects yet.</li>
        )}
      </ul>
    </>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
