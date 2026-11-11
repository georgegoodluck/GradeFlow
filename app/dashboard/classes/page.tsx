import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { deleteClass } from "@/app/actions/admin";
import { ClassForm } from "./ClassForm";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user?.schoolId) return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  const allClasses = await db.select().from(classes).where(eq(classes.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <h2 className="font-playfair text-3xl">Classes</h2>
      <ClassForm />
      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allClasses.map((cls) => (
          <li key={cls.id} className="flex items-center justify-between gap-3 p-4">
            <span className="min-w-0 flex-1 break-words font-medium">{cls.name}</span>
            <form action={deleteClass} className="shrink-0">
              <input type="hidden" name="id" value={cls.id} />
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
                title="Delete Class"
              >
                <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </form>
          </li>
        ))}
        {allClasses.length === 0 && <li className="p-4 text-center text-gray-500">No classes yet.</li>}
      </ul>
    </div>
  );
}
