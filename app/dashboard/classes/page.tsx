import { eq } from "drizzle-orm";
import { Plus, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { createClass, deleteClass } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user?.schoolId)
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  const allClasses = await db
    .select()
    .from(classes)
    .where(eq(classes.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Classes</h2>
      <form action={createClass} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          placeholder="Class name (e.g. JSS1)"
          required
          className="flex-1 rounded border p-3"
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded bg-gold px-6 py-2 text-charcoal sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Class
        </button>
      </form>
      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allClasses.map((cls) => (
          <li
            key={cls.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <span className="min-w-0 truncate">{cls.name}</span>
            <form action={deleteClass} className="shrink-0">
              <input type="hidden" name="id" value={cls.id} />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-500 transition hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" /> Delete
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
