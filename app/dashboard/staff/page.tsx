import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { AddStaffForm } from "./AddStaffForm";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Staff</h2>
      <Suspense fallback={<TableSkeleton />}>
        <StaffList />
      </Suspense>
    </div>
  );
}

async function StaffList() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");
  if (session.user.role !== "owner" && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const allStaff = await db
    .select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    })
    .from(staff)
    .where(eq(staff.schoolId, session.user.schoolId));

  return (
    <>
      <AddStaffForm />

      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allStaff.map((s) => (
          <li key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-gray-500">{s.email}</p>
            </div>
            <span className="rounded bg-gray-100 px-2 py-1 text-xs uppercase">
              {s.role}
            </span>
          </li>
        ))}
        {allStaff.length === 0 && (
          <li className="p-4 text-gray-500">No staff yet.</li>
        )}
      </ul>
    </>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
