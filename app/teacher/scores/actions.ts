'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { computeScore } from '@/lib/grading';

export async function saveScore(
  studentId: string,
  subjectId: string,
  termId: string,
  ca1: number,
  ca2: number,
  ca3: number,
  exam: number,
) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const { caAverage, total, grade } = computeScore(ca1, ca2, ca3, exam);

  await withTenant(session.user.schoolId, async (tx) => {
    // Upsert: create if new, update if it exists
    await tx.score.upsert({
      where: {
        studentId_subjectId_termId: { studentId, subjectId, termId },
      },
      create: {
        schoolId: session.user.schoolId,
        studentId,
        subjectId,
        termId,
        ca1,
        ca2,
        ca3,
        exam,
        caAverage,
        total,
        grade,
      },
      update: {
        ca1,
        ca2,
        ca3,
        exam,
        caAverage,
        total,
        grade,
      },
    });
  });
  revalidatePath('/teacher/scores');
}
