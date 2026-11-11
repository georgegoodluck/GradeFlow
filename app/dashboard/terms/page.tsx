import { eq, desc } from "drizzle-orm";
import { CalendarDays, CheckCircle, Plus } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { terms } from "@/db/schema";
import { startNewSession, setActiveTerm } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const session = await auth();
  if (!session?.user?.schoolId) return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  const allTerms = await db
    .select()
    .from(terms)
    .where(eq(terms.schoolId, session.user.schoolId))
    .orderBy(desc(terms.createdAt));

  const groupedTerms = allTerms.reduce((acc, term) => {
    if (!acc[term.session]) acc[term.session] = [];
    acc[term.session].push(term);
    return acc;
  }, {} as Record<string, typeof allTerms>);

  // Generate the next 6 academic sessions automatically
  const currentYear = new Date().getFullYear();
  const sessions = Array.from({ length: 6 }).map((_, i) => {
    const year = currentYear + i;
    return `${year}/${year + 1}`;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="font-playfair text-3xl">Academic Terms</h2>

      <div className="rounded-lg bg-white p-6 shadow-soft">
        <h3 className="text-lg font-medium mb-2">Start New Academic Session</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a session below. The system will automatically create First, Second, and Third Term for you.
        </p>
        <form action={startNewSession} className="flex flex-col sm:flex-row gap-3">
          <select
            name="session"
            required
            className="w-full cursor-pointer rounded border p-3 flex-1 bg-white focus:border-gold focus:outline-none"
          >
            <option value="">Select Academic Session</option>
            {sessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-gold px-6 py-3 text-charcoal font-medium transition hover:bg-[#d4b573] sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Create Session
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTerms).map(([sessionName, sessionTerms]) => (
          <div key={sessionName} className="rounded-lg bg-white p-6 shadow-soft">
            <h3 className="font-playfair text-xl mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gold" />
              {sessionName} Session
            </h3>
            <ul className="divide-y">
              {sessionTerms.map((term) => (
                <li key={term.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3">
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
                        className="cursor-pointer text-sm font-medium text-gold hover:underline"
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
            No sessions created yet. Create your first session above.
          </div>
        )}
      </div>
    </div>
  );
}
