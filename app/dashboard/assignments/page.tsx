import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { staff, classes, subjects, teacherSubjects } from "@/db/schema";
import { assignTeacher, removeAssignment } from "@/app/actions/assignments";

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Teacher Assignments</h2>
      <Suspense fallback={<TableSkeleton />}>
        <AssignmentList />
      </Suspense>
    </div>
  );
}

async function AssignmentList() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const sid = session.user.schoolId;

  const [allStaff, allSubjects, allClasses, assignments] = await Promise.all([
    db
      .select()
      .from(staff)
      .where(and(eq(staff.schoolId, sid), eq(staff.role, "teacher"))),
    db.select().from(subjects).where(eq(subjects.schoolId, sid)),
    db.select().from(classes).where(eq(classes.schoolId, sid)),
    db
      .select({
        id: teacherSubjects.id,
        teacherName: staff.name,
        subjectName: subjects.name,
        className: classes.name,
      })
      .from(teacherSubjects)
      .innerJoin(staff, eq(teacherSubjects.staffId, staff.id))
      .innerJoin(subjects, eq(teacherSubjects.subjectId, subjects.id))
      .innerJoin(classes, eq(teacherSubjects.classId, classes.id))
      .where(eq(teacherSubjects.schoolId, sid)),
  ]);

  return (
    <>
      <form
        action={assignTeacher}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-lg bg-white p-6 shadow-soft"
      >
        <select name="staffId" required className="rounded border p-3">
          <option value="">Select Teacher</option>
          {allStaff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="subjectId" required className="rounded border p-3">
          <option value="">Select Subject</option>
          {allSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
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
          className="rounded bg-gold px-6 py-2 text-charcoal font-medium"
        >
          Assign
        </button>
      </form>

      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {assignments.map((a) => (
          <li key={a.id} className="flex items-center justify-between p-4">
            <span>
              {a.teacherName} teaches <strong>{a.subjectName}</strong> in{" "}
              <strong>{a.className}</strong>
            </span>
            <form action={removeAssignment}>
              <input type="hidden" name="id" value={a.id} />
              <button type="submit" className="text-sm text-red-500">
                Remove
              </button>
            </form>
          </li>
        ))}
        {assignments.length === 0 && (
          <li className="p-4 text-gray-500">No assignments yet.</li>
        )}
      </ul>
    </>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
