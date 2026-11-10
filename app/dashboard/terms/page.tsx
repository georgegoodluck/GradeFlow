import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { terms } from "@/db/schema";
import { createTerm, setActiveTerm } from "@/app/actions/admin";

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Term Management</h2>
      <Suspense fallback={<TableSkeleton />}>
        <TermList />
      </Suspense>
    </div>
  );
}

async function TermList() {
  await connection();
  const session = await auth();
  if (!session?.user?.schoolId) redirect("/login");

  const allTerms = await db
    .select()
    .from(terms)
    .where(eq(terms.schoolId, session.user.schoolId))
    .orderBy(desc(terms.createdAt));

  return (
    <>
      <form
        action={createTerm}
        className="flex gap-3 rounded-lg bg-white p-6 shadow-soft"
      >
        <input
          name="name"
          placeholder="e.g. Second Term 2025/2026"
          required
          className="flex-1 rounded border p-3"
        />
        <button
          type="submit"
          className="rounded bg-gold px-6 py-2 text-charcoal"
        >
          Create Term
        </button>
      </form>

      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allTerms.map((term) => (
          <li key={term.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">{term.name}</span>
              {term.isActive ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              ) : (
                <form action={setActiveTerm}>
                  <input type="hidden" name="id" value={term.id} />
                  <button
                    type="submit"
                    className="text-sm text-gold hover:underline"
                  >
                    Set as Active
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
        {allTerms.length === 0 && (
          <li className="p-4 text-gray-500">No terms created yet.</li>
        )}
      </ul>
    </>
  );
}

function TableSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />;
}
