import { auth } from "@/auth";
import { db } from "@/db";
import { classes, subjects, students, staff } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const sid = session.user.schoolId;

  const [[classCount], [subjectCount], [studentCount], [staffCount]] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(classes)
        .where(eq(classes.schoolId, sid)),
      db
        .select({ value: count() })
        .from(subjects)
        .where(eq(subjects.schoolId, sid)),
      db
        .select({ value: count() })
        .from(students)
        .where(eq(students.schoolId, sid)),
      db.select({ value: count() }).from(staff).where(eq(staff.schoolId, sid)),
    ]);

  const stats = [
    { label: "Classes", value: classCount.value },
    { label: "Subjects", value: subjectCount.value },
    { label: "Students", value: studentCount.value },
    { label: "Staff", value: staffCount.value },
  ];

  return (
    <div className="space-y-8">
      <h2 className="font-playfair text-3xl">Dashboard</h2>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white p-6 shadow-soft">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-semibold text-charcoal">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
