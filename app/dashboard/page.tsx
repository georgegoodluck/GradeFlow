// app/dashboard/page.tsx
import { eq, count } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { classes, subjects, students, staff } from "@/db/schema";
import {
  Users,
  BookOpen,
  GraduationCap,
  School,
  FileText,
  Settings,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.schoolId)
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;

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
    {
      label: "Classes",
      value: classCount.value,
      icon: School,
      href: "/dashboard/classes",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Subjects",
      value: subjectCount.value,
      icon: BookOpen,
      href: "/dashboard/subjects",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Students",
      value: studentCount.value,
      icon: GraduationCap,
      href: "/dashboard/students",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Staff",
      value: staffCount.value,
      icon: Users,
      href: "/dashboard/staff",
      color: "bg-gold/10 text-gold",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-playfair text-3xl text-charcoal">Welcome back!</h2>
        <p className="text-sm text-gray-500">
          Here is an overview of your school.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl bg-white p-6 shadow-soft transition hover:shadow-lg"
          >
            <div className={`mb-4 inline-block rounded-lg p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-semibold text-charcoal">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-charcoal p-6 shadow-soft">
          <h3 className="font-playfair text-xl text-gold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" /> Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/reports"
              className="block rounded-lg bg-white/10 p-3 text-sm text-white hover:bg-white/20 transition"
            >
              Download Student Reports
            </Link>
            <Link
              href="/dashboard/terms"
              className="block rounded-lg bg-white/10 p-3 text-sm text-white hover:bg-white/20 transition"
            >
              Manage Academic Terms
            </Link>
            <Link
              href="/dashboard/settings"
              className="block rounded-lg bg-white/10 p-3 text-sm text-white hover:bg-white/20 transition flex items-center gap-2"
            >
              <Settings className="h-4 w-4" /> School Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
