'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function createTerm(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const sessionName = String(formData.get('session') ?? '').trim();
  const termName = String(formData.get('name') ?? '').trim();
  if (!sessionName || !termName) throw new Error('Missing fields');

  try {
    await withTenant(session.user.schoolId, async (tx) => {
      // If this is the first term, make it active by default
      const count = await tx.term.count();
      await tx.term.create({
        data: {
          schoolId: session.user.schoolId,
          session: sessionName,
          name: termName,
          isActive: count === 0,
        },
      });
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'P2002'
    ) {
      throw new Error('This term already exists. Please choose a different session or term name.');
    }
    throw new Error('Failed to create term.');
  }

  revalidatePath('/admin/terms');
}

export async function setActiveTerm(termId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await withTenant(session.user.schoolId, async (tx) => {
    // Turn off active for all terms in this school
    await tx.term.updateMany({
      where: { schoolId: session.user.schoolId },
      data: { isActive: false },
    });

    // Turn on active for the selected term
    await tx.term.update({
      where: { id: termId },
      data: { isActive: true },
    });
  });

  revalidatePath('/admin/terms');
}
