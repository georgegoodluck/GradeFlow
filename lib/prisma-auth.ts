import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_URL!, // Uses the owner connection
  connectionTimeoutMillis: 30000,
});

export const prismaAuth = new PrismaClient({ adapter });
