import { saveFirstTerm } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";

export default function TermStep() {
  const currentYear = new Date().getFullYear();
  // Generate sessions from current year up to +5 years (e.g., 2026/2027)
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
