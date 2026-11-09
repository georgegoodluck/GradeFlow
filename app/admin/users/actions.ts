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

  if (!name || !email || password.length < 6) throw new Error('Invalid input');

  // Pre-check to prevent ugly Prisma errors
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

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
  revalidatePath('/admin/users');
}
