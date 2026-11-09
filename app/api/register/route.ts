import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { withTenant } from '@/lib/tenant';

const PRIMARY_CLASSES = [
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolName, slug, email, password, name } = body;

    if (!schoolName || !slug || !email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Pre-flight checks (School and global email checks outside tenant context)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const slugTaken = await prisma.school.findUnique({ where: { slug } });
    if (slugTaken) {
      return NextResponse.json({ error: 'School slug taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Create the school entity first (RLS disabled or non-tenant table)
    const school = await prisma.school.create({
      data: {
        name: schoolName,
        slug,
      },
    });

    // 3. Perform tenant-scoped writes inside withTenant so session variables/RLS policies are satisfied
    await withTenant(school.id, async (tx) => {
      await tx.user.create({
        data: {
          schoolId: school.id,
          email,
          passwordHash,
          name,
          role: 'OWNER',
        },
      });

      await tx.class.createMany({
        data: PRIMARY_CLASSES.map((c) => ({
          schoolId: school.id,
          name: c,
        })),
      });
    });

    return NextResponse.json({ schoolId: school.id }, { status: 201 });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 },
    );
  }
}
