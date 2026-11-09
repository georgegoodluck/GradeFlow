import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { withTenant } from '@/lib/tenant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolName, email, password, name } = body;

    if (!schoolName || !email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Auto-generate Slug
    const baseSlug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 1;

    // 2. Ensure slug is unique
    while (await prisma.school.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Case-Insensitive Email Check
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // 4. Case-Insensitive School Name Check
    const existingSchool = await prisma.school.findFirst({
      where: { name: { equals: schoolName, mode: 'insensitive' } },
    });
    if (existingSchool) {
      return NextResponse.json(
        { error: 'A school with this name already exists' },
        { status: 409 },
      );
    }

    // 5. Create the school
    const school = await prisma.school.create({
      data: { name: schoolName, slug },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    // 6. Create user inside tenant context
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
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
