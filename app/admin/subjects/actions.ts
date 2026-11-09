'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function createSubject(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Name required');

  await withTenant(session.user.schoolId, async (tx) => {
    await tx.subject.create({
      data: { schoolId: session.user.schoolId, name },
    });
  });
  revalidatePath('/admin/subjects');
}

export async function deleteSubject(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  await withTenant(session.user.schoolId, async (tx) => {
    await tx.subject.delete({ where: { id } });
  });
  revalidatePath('/admin/subjects');
}
