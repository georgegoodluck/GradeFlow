'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'TEACHER') as 'ADMIN' | 'TEACHER';

  if (!name || !email || password.length < 6) {
    throw new Error('Please fill all fields. Password must be at least 6 characters.');
  }

  // 1. Pre-check to give a nice error message
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('This email is already registered to another user.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // 2. Catch any RLS or Database errors
  try {
    await withTenant(session.user.schoolId, async (tx) => {
      await tx.user.create({
        data: {
          schoolId: session.user.schoolId,
          name,
          email,
          passwordHash,
          role,
        },
      });
    });
  } catch (error) {
    throw new Error('Could not create user. Please try again.');
  }

  revalidatePath('/admin/users');
}
