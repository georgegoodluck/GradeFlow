'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';

export async function assignTeacher(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const teacherId = String(formData.get('teacherId'));
  const subjectId = String(formData.get('subjectId'));
  const classId = String(formData.get('classId'));

  await withTenant(session.user.schoolId, async (tx) => {
    await tx.teacherSubject.create({
      data: { schoolId: session.user.schoolId, teacherId, subjectId, classId },
    });
  });
  revalidatePath('/admin/assignments');
}

export async function unassignTeacher(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  await withTenant(session.user.schoolId, async (tx) => {
    await tx.teacherSubject.delete({ where: { id } });
  });
  revalidatePath('/admin/assignments');
}
