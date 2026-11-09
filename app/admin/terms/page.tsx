export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/PageHeader';
import { TermForm } from './TermsForm';
import { redirect } from 'next/navigation';
import { setActiveTerm } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { calculateRankings } from './ranking';

export default async function TermsPage() {
  const session = await auth();

  if (!session?.user?.schoolId) {
    redirect('/login');
  }

  // Fetch terms and a sample student for the PDF test
  const { terms, sampleStudentId } = await withTenant(session.user.schoolId, async (tx) => {
    const terms = await tx.term.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Fetch just one student ID to use for the sample PDF link
    const student = await tx.student.findFirst({
      select: { id: true },
    });

    return { terms, sampleStudentId: student?.id };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Terms" description="Manage sessions and terms" />

      <TermForm />

      <div className="shadow-soft overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 text-muted-foreground border-b text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-3">Session</th>
              <th className="px-6 py-3">Term</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {terms.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted-foreground px-6 py-12 text-center text-sm">
                  No terms added yet. Create one to begin entering scores.
                </td>
              </tr>
            ) : (
              terms.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-medium">{t.session}</td>
                  <td className="px-6 py-4 text-sm">{t.name}</td>
                  <td className="px-6 py-4 text-sm">
                    {t.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {t.isActive ? (
                      <div className="flex items-center justify-end gap-2">
                        <form
                          action={async () => {
                            'use server';
                            await calculateRankings(t.id);
                          }}
                        >
                          <SubmitButton variant="secondary" size="sm">
                            Finalize Rankings
                          </SubmitButton>
                        </form>

                        {sampleStudentId && (
                          <a
                            href={`/api/reports/${sampleStudentId}/${t.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {/* We use Button asChild if you are using shadcn, otherwise just style a regular link */}
                            <SubmitButton variant="outline" size="sm">
                              Download Sample PDF
                            </SubmitButton>
                          </a>
                        )}
                      </div>
                    ) : (
                      <form
                        action={async () => {
                          'use server';
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
