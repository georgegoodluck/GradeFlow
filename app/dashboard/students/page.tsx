import { eq } from "drizzle-orm";
import { UserPlus, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { students, classes } from "@/db/schema";
import { addStudent, deleteStudent } from "@/app/actions/students";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.schoolId)
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;

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
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Students</h2>
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
          className="flex items-center justify-center gap-2 rounded bg-gold px-6 py-2 text-charcoal"
        >
          <UserPlus className="h-4 w-4" /> Add Student
        </button>
      </form>
      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allStudents.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
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
              <button
                type="submit"
                className="flex items-center gap-2 text-sm text-red-500 transition hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </form>
          </li>
        ))}
        {allStudents.length === 0 && (
          <li className="p-4 text-gray-500">No students yet.</li>
        )}
      </ul>
    </div>
  );
}
