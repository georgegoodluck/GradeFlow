'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function assignTeacher(formData: FormData) {
  const session = await auth();
  if (!session?.staff) throw new Error('Unauthorized');
  const staffId = String(formData.get('staffId'));
  const subjectId = String(formData.get('subjectId'));
  const classId = String(formData.get('classId'));

  await withTenant(session.staff.schoolId, async (tx) => {
    await tx.teacherSubject.create({
      data: { schoolId: session.staff.schoolId, staffId, subjectId, classId },
    });
  });
  revalidatePath('/admin/assignments');
}

export async function unassignTeacher(id: string) {
  const session = await auth();
  if (!session?.staff) throw new Error('Unauthorized');
  await withTenant(session.staff.schoolId, async (tx) => {
    await tx.teacherSubject.delete({ where: { id } });
  });
  revalidatePath('/admin/assignments');
}
