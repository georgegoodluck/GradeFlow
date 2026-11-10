import { Suspense } from "react";
import { connection } from "next/server";
import { saveFirstTerm } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export default function TermStep() {
  return (
    <Suspense fallback={<TermSkeleton />}>
      <TermForm />
    </Suspense>
  );
}

async function TermForm() {
  await connection(); // Tells Next.js 16 this part is dynamic

  const currentYear = new Date().getFullYear();
  const sessions = Array.from({ length: 6 }).map((_, i) => {
    const year = currentYear + i;
    return `${year}/${year + 1}`;
  });

  return (
    <form action={saveFirstTerm} className="space-y-6">
      <div>
        <h2 className="font-playfair text-2xl mb-2">First Term</h2>
        <p className="text-sm text-gray-500">
          Set up the initial academic session and term.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Academic Session</label>
          <select
            name="session"
            className="mt-1 w-full rounded border p-3"
            required
          >
            {sessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Term Name</label>
          <input
            name="name"
            placeholder="e.g. First Term"
            defaultValue="First Term"
            required
            className="mt-1 w-full rounded border p-3"
          />
        </div>
      </div>

      <SubmitButton>Continue</SubmitButton>
    </form>
  );
}

function TermSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-1/3 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="h-12 w-full rounded bg-gray-200" />
      <div className="h-12 w-full rounded bg-gray-200" />
      <div className="h-12 w-1/3 rounded bg-gray-200" />
    </div>
  );
}
