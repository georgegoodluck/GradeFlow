import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { addStaffMember } from "@/app/actions/admin";

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
      <form
        action={addStaffMember}
        className="grid gap-3 rounded-lg bg-white p-6 shadow-soft"
      >
        <input
          name="name"
          placeholder="Full name"
          required
          className="rounded border p-3"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border p-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 chars)"
          required
          className="rounded border p-3"
        />
        <select name="role" className="rounded border p-3">
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="rounded bg-gold px-6 py-2 text-charcoal"
        >
          Add Staff
        </button>
      </form>

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
