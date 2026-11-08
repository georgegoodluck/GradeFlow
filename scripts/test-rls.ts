import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { withTenant } from '../lib/tenant';

async function main() {
  // Create two schools (run as owner? No — app_user also needs to insert, but policies will block inserts without schoolId)
  // First use withTenant to create school A data
  await withTenant('school-a', async (tx) => {
    await tx.school.create({
      data: { id: 'school-a', name: 'School A', slug: 'school-a' },
    });
    await tx.user.create({
      data: {
        schoolId: 'school-a',
        email: 'a@test.com',
        passwordHash: 'x',
        name: 'User A',
        role: 'ADMIN',
      },
    });
  });

  await withTenant('school-b', async (tx) => {
    await tx.school.create({
      data: { id: 'school-b', name: 'School B', slug: 'school-b' },
    });
    await tx.user.create({
      data: {
        schoolId: 'school-b',
        email: 'b@test.com',
        passwordHash: 'x',
        name: 'User B',
        role: 'ADMIN',
      },
    });
  });

  // Query as school A — should only see A's users
  const usersA = await withTenant('school-a', async (tx) => {
    return tx.user.findMany();
  });

  console.log(
    'Users visible as school-a:',
    usersA.map((u) => u.name),
  );
  // Expected: ['User A']

  // Query without setting context — should return empty array (fail closed)
  const noContext = await prisma.user.findMany();
  console.log('Users without context:', noContext);
  // Expected: []
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
