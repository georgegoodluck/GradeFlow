import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq, count } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, subjects, students, staff } from "@/db/schema";

export default function DashboardPage() {
  return (
    <Suspense fallback={<StatsSkeleton />}>
      <StatsGrid />
    </Suspense>
  );
}

async function StatsGrid() {
  await connection();
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
      <div>
        <h2 className="font-playfair text-3xl text-charcoal">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Signed in as {session.user.email}
        </p>
      </div>
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

function StatsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
