import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const PRIMARY_CLASSES = [
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
];

export async function POST(req: Request) {
  const body = await req.json();
  const { schoolName, slug, email, password, name } = body;

  if (!schoolName || !slug || !email || !password || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const slugTaken = await prisma.school.findUnique({ where: { slug } });
  if (slugTaken) {
    return NextResponse.json({ error: 'School slug taken' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const school = await prisma.school.create({
    data: {
      name: schoolName,
      slug,
      users: {
        create: {
          email,
          passwordHash,
          name,
          role: 'OWNER',
        },
      },
      classes: {
        create: PRIMARY_CLASSES.map((c) => ({ name: c })),
      },
    },
  });

  return NextResponse.json({ schoolId: school.id }, { status: 201 });
}
