import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { students, classes } from "@/db/schema";
import { addStudent, deleteStudent } from "@/app/actions/students";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Students</h2>
      <Suspense fallback={<TableSkeleton />}>
        <StudentList />
      </Suspense>
    </div>
  );
}

async function StudentList() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const allStudents = await db
    .select({
      id: students.id,
      name: students.name,
      admissionNo: students.admissionNo,
      email: students.email,
      className: classes.name,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(eq(students.schoolId, session.user.schoolId));

  const allClasses = await db
    .select()
    .from(classes)
    .where(eq(classes.schoolId, session.user.schoolId));

  return (
    <>
      <form
        action={addStudent}
        className="grid gap-3 rounded-lg bg-white p-6 shadow-soft"
      >
        <input
          name="name"
          placeholder="Student Full Name"
          required
          className="rounded border p-3"
        />
        <input
          name="admissionNo"
          placeholder="Admission No (e.g. ADM001)"
          required
          className="rounded border p-3"
        />
        <select name="classId" required className="rounded border p-3">
          <option value="">Select Class</option>
          {allClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded bg-gold px-6 py-2 text-charcoal"
        >
          Add Student
        </button>
      </form>

      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allStudents.map((s) => (
          <li key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">
                {s.name} ({s.admissionNo})
              </p>
              <p className="text-sm text-gray-500">
                {s.className ?? "No class"} | {s.email}
              </p>
            </div>
            <form action={deleteStudent}>
              <input type="hidden" name="id" value={s.id} />
              <button type="submit" className="text-sm text-red-500">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
