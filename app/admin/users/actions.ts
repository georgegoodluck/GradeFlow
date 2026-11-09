'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { prismaAuth } from '@/lib/prisma-auth';

export async function createstaff(formData: FormData) {
  const session = await auth();
  if (!session?.staff?.schoolId) throw new Error('Unauthorized');

  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'TEACHER') as 'ADMIN' | 'TEACHER';

  if (!firstName || !lastName || !email || password.length < 6) {
    throw new Error('Please fill all fields. Password must be at least 6 characters.');
  }

  // 1. Pre-check to give a nice error message
  //    Uses prismaAuth (no RLS) since login itself must be tenant-agnostic;
  //    scope the check to this school so the same email can exist in another tenant
  //    (remove the schoolId clause if email is globally @unique on Staff).
  const existing = await prismaAuth.staff.findFirst({
    where: { email, schoolId: session.staff.schoolId },
  });
  if (existing) {
    throw new Error('This email is already registered to another staff member.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // 2. Catch any RLS or Database errors
  try {
    await withTenant(session.staff.schoolId, async (tx) => {
      await tx.staff.create({
        data: {
          schoolId: session.staff.schoolId,
          firstName,
          lastName,
          email,
          passwordHash,
          role,
        },
      });
    });
  } catch (error) {
    throw new Error('Could not create staff member. Please try again.');
  }

  revalidatePath('/admin/staffs');
}
