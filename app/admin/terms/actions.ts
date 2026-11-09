'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function createTerm(formData: FormData) {
  const session = await auth();
  if (!session?.user?.schoolId) {
    throw new Error('Unauthorized');
  }

  const sessionName = String(formData.get('session') ?? '').trim();
  const termName = String(formData.get('name') ?? '').trim();

  if (!sessionName || !termName) {
    throw new Error('Session and Term name are required.');
  }

  try {
    await withTenant(session.user.schoolId, async (tx) => {
      // If this is the school's first term, make it active by default
      const count = await tx.term.count({
        where: { schoolId: session.user.schoolId },
      });

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
    // Prisma unique constraint violation code (e.g. @@unique([schoolId, session, name]))
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
  if (!session?.user?.schoolId) {
    throw new Error('Unauthorized');
  }

  if (!termId?.trim()) {
    throw new Error('Term ID is required.');
  }

  await withTenant(session.user.schoolId, async (tx) => {
    // Deactivate all terms for the current school
    await tx.term.updateMany({
      where: { schoolId: session.user.schoolId },
      data: { isActive: false },
    });

    // Activate the targeted term scoped to this school to prevent cross-tenant updates
    await tx.term.update({
      where: {
        id: termId,
        schoolId: session.user.schoolId,
      },
      data: { isActive: true },
    });
  });

  revalidatePath('/admin/terms');
}
