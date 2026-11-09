import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { withTenant } from '@/lib/tenant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolName, slug, email, password, name } = body;

    if (!schoolName || !slug || !email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // 2. Check if slug exists
    const slugTaken = await prisma.school.findUnique({ where: { slug } });
    if (slugTaken) {
      return NextResponse.json({ error: 'School slug taken' }, { status: 409 });
    }

    // 3. Create the school (No RLS on this table)
    const school = await prisma.school.create({
      data: { name: schoolName, slug },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create user inside tenant context
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
    });

    return NextResponse.json({ schoolId: school.id }, { status: 201 });
  } catch (error: unknown) {
    console.error('REGISTRATION ERROR:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred during registration.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
