import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { createTerm, setActiveTerm } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';

export default async function TermsPage() {
  const session = await auth();
  const terms = await prisma.term.findMany({
    where: { schoolId: session!.user.schoolId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader title="Academic Terms" description="Manage sessions and terms" />

      <form
        action={createTerm}
        className="shadow-soft mb-8 flex flex-wrap gap-2 rounded-lg border bg-white p-4"
      >
        <Input
          name="session"
          placeholder="Session (e.g. 2025/2026)"
          required
          className="max-w-[200px]"
        />
        <Input
          name="name"
          placeholder="Term (e.g. First Term)"
          required
          className="max-w-[200px]"
        />
        <SubmitButton>Add Term</SubmitButton>
      </form>

      <div className="shadow-soft overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-3">Session</th>
              <th className="px-6 py-3">Term</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  No terms added yet. Create one to begin entering scores.
                </td>
              </tr>
            )}
            {terms.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-6 py-4 text-sm">{t.session}</td>
                <td className="px-6 py-4 text-sm">{t.name}</td>
                <td className="px-6 py-4">
                  {t.isActive ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold tracking-wider text-green-700 uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs tracking-wider text-gray-500 uppercase">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {!t.isActive && (
                    <form
                      action={async () => {
                        await setActiveTerm(t.id);
                      }}
                    >
                      <SubmitButton variant="outline" size="sm">
                        Set Active
                      </SubmitButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
