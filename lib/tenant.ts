import { prisma } from './prisma';
import 'server-only';

export async function withTenant<T>(
  schoolId: string,
  callback: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_school_id', ${schoolId}, true)`;
      return callback(tx);
    },
    {
      maxWait: 15000, // wait up to 15s to acquire a connection (cold start)
      timeout: 30000, // allow the transaction up to 30s to finish
    },
  );
}
