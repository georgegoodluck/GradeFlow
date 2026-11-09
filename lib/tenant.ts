import { prisma } from './prisma';

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
      maxWait: 20000, // Wait up to 20s to acquire a connection (Neon cold start)
      timeout: 30000, // Allow the transaction 30s to finish
    },
  );
}
