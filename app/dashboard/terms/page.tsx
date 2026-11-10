import { eq, desc } from "drizzle-orm";
import { CalendarDays, CheckCircle, Plus, AlertCircle } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { terms } from "@/db/schema";
import { createNextTerm, setActiveTerm } from "@/app/actions/admin";

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

  // Group terms by session
  const groupedTerms = allTerms.reduce(
    (acc, term) => {
      if (!acc[term.session]) acc[term.session] = [];
      acc[term.session].push(term);
      return acc;
    },
    {} as Record<string, typeof allTerms>,
  );

  return (
    <div className="space-y-6">
      <h2 className="font-playfair text-3xl">Academic Terms</h2>

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <p className="text-sm text-gray-600 mb-4">
          Create the next term for an academic session. Term order is strictly:
          First, Second, Third.
        </p>
        <form
          action={createNextTerm}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            name="session"
            placeholder="Session (e.g. 2026/2027)"
            required
            className="rounded border p-3 flex-1"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded bg-gold px-6 py-2 text-charcoal"
          >
            <Plus className="h-4 w-4" /> Create Next Term
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTerms).map(([sessionName, sessionTerms]) => (
          <div
            key={sessionName}
            className="rounded-lg bg-white p-6 shadow-soft"
          >
            <h3 className="font-playfair text-xl mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gold" />
              {sessionName} Session
            </h3>
            <ul className="divide-y">
              {sessionTerms.map((term) => (
                <li
                  key={term.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3"
                >
                  <div>
                    <p className="font-medium">{term.name}</p>
                  </div>
                  {term.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" /> Active Now
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
            </ul>
          </div>
        ))}
        {allTerms.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-soft">
            No terms created yet. Create your first term above.
          </div>
        )}
      </div>
    </div>
  );
}
