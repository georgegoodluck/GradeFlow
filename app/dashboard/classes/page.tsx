import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { createClass, deleteClass } from "@/app/actions/admin";

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Classes</h2>
      <Suspense fallback={<TableSkeleton />}>
        <ClassList />
      </Suspense>
    </div>
  );
}

async function ClassList() {
  await connection(); // Forces dynamic rendering
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const allClasses = await db
    .select()
    .from(classes)
    .where(eq(classes.schoolId, session.user.schoolId));

  return (
    <>
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
    </>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
