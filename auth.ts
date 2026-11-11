import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authDb } from "./db";
import { staff, students } from "./db/schema";

function isCredentialsInput(value: unknown): value is { email: string; password: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    typeof (value as Record<string, unknown>).email === "string" &&
    "password" in value &&
    typeof (value as Record<string, unknown>).password === "string"
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: unknown) {
        if (!isCredentialsInput(credentials)) return null;
        const { email, password } = credentials;

        const [staffMember] = await authDb.select().from(staff).where(eq(staff.email, email)).limit(1);
        if (staffMember) {
          const valid = await bcrypt.compare(password, staffMember.passwordHash);
          if (!valid) return null;
          return {
            id: staffMember.id,
            email: staffMember.email,
            name: staffMember.name,
            role: staffMember.role,
            schoolId: staffMember.schoolId,
            userType: "staff" as const,
          };
        }

        const [student] = await authDb.select().from(students).where(eq(students.email, email)).limit(1);
        if (student) {
          const valid = await bcrypt.compare(password, student.passwordHash);
          if (!valid) return null;
          return {
            id: student.id,
            email: student.email,
            name: student.name,
            role: "student" as const,
            schoolId: student.schoolId,
            userType: "student" as const,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.schoolId = (user as { schoolId: string }).schoolId;
        token.role = (user as { role: string }).role;
        token.userType = (user as { userType: string }).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.schoolId = token.schoolId as string;
        session.user.role = token.role as string;
        session.user.userType = token.userType as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});
