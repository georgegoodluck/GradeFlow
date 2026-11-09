'use server';

import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export async function calculateRankings(termId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  await withTenant(session.user.schoolId, async (tx) => {
    // 1. Calculate Subject Ranks
    // We use raw SQL because Prisma doesn't have a native RANK() window function yet
    await tx.$executeRaw`
      WITH RankedScores AS (
        SELECT id, RANK() OVER (
          PARTITION BY "subjectId", "termId" 
          ORDER BY total DESC
        ) as new_rank
        FROM "Score"
        WHERE "schoolId" = ${session.user.schoolId} AND "termId" = ${termId}
      )
      UPDATE "Score"
      SET "subjectRank" = RankedScores.new_rank
      FROM RankedScores
      WHERE "Score".id = RankedScores.id;
    `;

    // 2. Calculate Overall Class Position
    // We group by student, get their average, and rank them within their class
    await tx.$executeRaw`
      WITH StudentAverages AS (
        SELECT s.id as "studentId", c.id as "classId", AVG(sc.total) as average
        FROM "Student" s
        JOIN "Score" sc ON s.id = sc."studentId"
        JOIN "Class" c ON s."classId" = c.id
        WHERE sc."termId" = ${termId} AND s."schoolId" = ${session.user.schoolId}
        GROUP BY s.id, c.id
      ),
      ClassRanks AS (
        SELECT "studentId", RANK() OVER (
          PARTITION BY "classId" 
          ORDER BY average DESC
        ) as position
        FROM StudentAverages
      )
      UPDATE "Student"
      SET "overallPosition" = ClassRanks.position
      FROM ClassRanks
      WHERE "Student".id = ClassRanks."studentId";
    `;
  });

  revalidatePath('/admin/terms');
}
