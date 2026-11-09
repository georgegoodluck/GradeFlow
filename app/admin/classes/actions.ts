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
      await tx.class.create({
        data: { schoolId: session.user.schoolId, name },
      });
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('A class with this name already exists.');
    }
    throw new Error('Failed to create class.');
  }

  revalidatePath('/admin/classes');
}
  