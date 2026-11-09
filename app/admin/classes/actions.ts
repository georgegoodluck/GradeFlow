'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function createClass(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Name required');

  await withTenant(session.user.schoolId, async (tx) => {
    await tx.class.create({
      data: { schoolId: session.user.schoolId, name },
    });
  });
  revalidatePath('/admin/classes');
}
