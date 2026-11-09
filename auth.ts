import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prismaAuth } from '@/lib/prisma-auth'; // CHANGED: Import the auth client
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // 1. Check if it's a Staff member (Admin/Teacher/Owner)
        const staff = await prismaAuth.staff.findUnique({
          where: { email },
        });

        if (staff) {
          const valid = await bcrypt.compare(password, staff.passwordHash);
          if (!valid) return null;
          return {
            id: staff.id,
            email: staff.email,
            name: `${staff.firstName} ${staff.lastName}`,
            role: staff.role,
            schoolId: staff.schoolId,
          };
        }

        // 2. If not Staff, check if it's a Student
        const student = await prismaAuth.student.findUnique({
          where: { email },
        });

        if (student) {
          const valid = await bcrypt.compare(password, student.passwordHash);
          if (!valid) return null;
          return {
            id: student.id,
            email: student.email,
            name: `${student.firstName} ${student.lastName}`,
            role: 'STUDENT',
            schoolId: student.schoolId,
          };
        }

        return null; // Neither staff nor student found
      },
    }),
  ],
});
