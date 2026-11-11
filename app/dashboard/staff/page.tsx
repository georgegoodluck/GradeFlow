import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { AddStaffForm } from "./AddStaffForm";
import { UserCog, KeyRound, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const session = await auth();
  if (!session?.user?.schoolId || (session.user.role !== "owner" && session.user.role !== "admin")) {
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;
  }

  const allStaff = await db.select({
    id: staff.id, name: staff.name, email: staff.email, role: staff.role, password: staff.plainPassword,
  }).from(staff).where(eq(staff.schoolId, session.user.schoolId));

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <h2 className="font-playfair text-3xl">Staff Management</h2>
      <AddStaffForm />

      <div className="overflow-x-auto rounded-lg bg-white shadow-soft">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Name</th>
              <th className="p-4 font-medium text-gray-500">Email</th>
              <th className="p-4 font-medium text-gray-500">Role</th>
              <th className="p-4 font-medium text-gray-500">Password</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allStaff.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-charcoal flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-gray-400" /> {s.name}
                </td>
                <td className="p-4 text-gray-600">{s.email}</td>
                <td className="p-4">
                  <span className={`rounded px-2 py-1 text-xs font-medium uppercase ${
                    s.role === "owner" ? "bg-gold/20 text-gold" : s.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                  }`}>{s.role}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded w-fit">
                    <KeyRound className="h-3 w-3 text-gray-500" /> {s.password}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
