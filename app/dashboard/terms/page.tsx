import { eq, desc } from "drizzle-orm";
import { CalendarDays, CheckCircle, Plus } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { terms } from "@/db/schema";
import { createTerm, setActiveTerm } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const session = await auth();
  if (!session?.user?.schoolId)
    return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  const allTerms = await db
    .select()
    .from(terms)
    .where(eq(terms.schoolId, session.user.schoolId))
    .orderBy(desc(terms.createdAt));

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Terms</h2>
      <form
        action={createTerm}
        className="grid gap-3 rounded-lg bg-white p-6 shadow-soft sm:grid-cols-3"
      >
        <input
          name="name"
          placeholder="e.g. First Term"
          required
          className="rounded border p-3"
        />
        <input
          name="session"
          placeholder="e.g. 2026/2027"
          required
          className="rounded border p-3"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded bg-gold px-6 py-2 text-charcoal"
        >
          <Plus className="h-4 w-4" /> Create Term
        </button>
      </form>
      <ul className="divide-y rounded-lg bg-white shadow-soft">
        {allTerms.map((term) => (
          <li
            key={term.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{term.name}</p>
                <p className="text-sm text-gray-500">{term.session}</p>
              </div>
            </div>
            {term.isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle className="h-3 w-3" /> Active
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
          </li>
        ))}
        {allTerms.length === 0 && (
          <li className="p-4 text-gray-500">No terms created yet.</li>
        )}
      </ul>
    </div>
  );
}
