'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function createStudent(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const admissionNo = String(formData.get('admissionNo') ?? '').trim();
  const classId = String(formData.get('classId') ?? '');

  if (!firstName || !lastName || !admissionNo || !classId) {
    throw new Error('All fields are required.');
  }

  const passwordHash = await bcrypt.hash('password123', 10); // Default password for students
  const email = `${admissionNo.toLowerCase()}@student.local`; // Fake email for login

  try {
    await withTenant(session.user.schoolId, async (tx) => {
      // Check if admission number exists
      const existing = await tx.student.findFirst({
        where: { admissionNo: { equals: admissionNo, mode: 'insensitive' } },
      });
      if (existing) throw new Error('DUPLICATE');

      // 1. Create a User account for the student (so they can log in)
      const user = await tx.user.create({
        data: {
          schoolId: session.user.schoolId,
          email,
          passwordHash,
          name: `${firstName} ${lastName}`,
          role: 'STUDENT',
        },
      });

      // 2. Create the Student profile
      await tx.student.create({
        data: {
          schoolId: session.user.schoolId,
          userId: user.id,
          firstName,
          lastName,
          admissionNo,
          classId,
        },
      });
    });
  } catch (error: any) {
    if (error.message === 'DUPLICATE' || error.code === 'P2002') {
      throw new Error('A student with this admission number already exists.');
    }
    throw new Error('Failed to create student.');
  }

  revalidatePath('/admin/students');
}
