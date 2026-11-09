'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function createClass(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Name required');

  try {
    await withTenant(session.user.schoolId, async (tx) => {
      const existing = await tx.class.findFirst({
        where: {
          schoolId: session.user.schoolId,
          name: { equals: name, mode: 'insensitive' },
        },
      });

      if (existing) throw new Error('DUPLICATE');

      await tx.class.create({
        data: { schoolId: session.user.schoolId, name },
      });
    });
  } catch (error: unknown) {
    const isDuplicate =
      (error instanceof Error && error.message === 'DUPLICATE') ||
      (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002');

    if (isDuplicate) {
      throw new Error(`A class named "${name}" already exists.`);
    }
    throw new Error('Failed to create class.');
  }

  revalidatePath('/admin/classes');
}
