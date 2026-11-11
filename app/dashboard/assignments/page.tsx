import { eq, and } from "drizzle-orm";
import { ClipboardList, Trash2, UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { staff, classes, subjects, teacherSubjects } from "@/db/schema";
import { assignTeacher, removeAssignment } from "@/app/actions/assignments";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const session = await auth();
  if (!session?.user?.schoolId) return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  const sid = session.user.schoolId;
  const [allStaff, allSubjects, allClasses, assignments] = await Promise.all([
    db.select().from(staff).where(and(eq(staff.schoolId, sid), eq(staff.role, "teacher"))),
    db.select().from(subjects).where(eq(subjects.schoolId, sid)),
    db.select().from(classes).where(eq(classes.schoolId, sid)),
    db.select({ id: teacherSubjects.id, teacherName: staff.name, subjectName: subjects.name, className: classes.name })
      .from(teacherSubjects).innerJoin(staff, eq(teacherSubjects.staffId, staff.id)).innerJoin(subjects, eq(teacherSubjects.subjectId, subjects.id)).innerJoin(classes, eq(teacherSubjects.classId, classes.id)).where(eq(teacherSubjects.schoolId, sid)),
  ]);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <h2 className="font-playfair text-3xl">Teacher Assignments</h2>
      <form action={assignTeacher} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-soft sm:p-6">
        <select name="staffId" required className="w-full cursor-pointer rounded border p-3"><option value="">Select Teacher</option>{allStaff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select name="subjectId" required className="w-full cursor-pointer rounded border p-3"><option value="">Select Subject</option>{allSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select name="classId" required className="w-full cursor-pointer rounded border p-3"><option value="">Select Class</option>{allClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <button type="submit" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-gold px-6 py-3 font-medium text-charcoal transition hover:bg-[#d4b573]"><UserPlus className="h-4 w-4" /> Assign Teacher</button>
      </form>
      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {assignments.map((a) => (
          <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0"><ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" /><p className="text-sm leading-relaxed text-charcoal"><span className="font-medium">{a.teacherName}</span> teaches <span className="font-medium text-gold">{a.subjectName}</span> in <span className="font-medium">{a.className}</span></p></div>
            <form action={removeAssignment} className="shrink-0"><input type="hidden" name="id" value={a.id} /><button type="submit" className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-red-50 p-2 text-sm text-red-500 transition hover:text-red-600 sm:w-auto"><Trash2 className="h-4 w-4" /> Remove</button></form>
          </li>
        ))}
        {assignments.length === 0 && <li className="p-6 text-center text-gray-500">No assignments yet.</li>}
      </ul>
    </div>
  );
}
