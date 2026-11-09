import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

console.log('Pinging DB every 4 minutes to prevent Neon cold starts...');

setInterval(
  async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('DB pinged successfully', new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Ping failed', e);
    }
  },
  4 * 60 * 1000,
);
