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

        // CHANGE FROM user TO staff
        const staff = await prismaAuth.staff.findUnique({
          where: { email: credentials.email as string },
        });

        if (!staff) return null;

        const valid = await bcrypt.compare(credentials.password as string, staff.passwordHash);
        if (!valid) return null;

        return {
          id: staff.id,
          email: staff.email,
          name: `${staff.firstName} ${staff.lastName}`,
          role: staff.role,
          schoolId: staff.schoolId,
        };
      },
    }),
  ],
});
