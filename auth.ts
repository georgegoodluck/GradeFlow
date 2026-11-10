import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { authDb } from "./db";
import { schools, staff, students } from "./db/schema";

// Type guard for the credentials input
function isCredentialsInput(
  value: unknown,
): value is { email: string; password: string; schoolCode: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    typeof (value as Record<string, unknown>).email === "string" &&
    "password" in value &&
    typeof (value as Record<string, unknown>).password === "string" &&
    "schoolCode" in value &&
    typeof (value as Record<string, unknown>).schoolCode === "string"
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        schoolCode: { label: "School", type: "text" },
      },
      async authorize(credentials: unknown) {
        if (!isCredentialsInput(credentials)) return null;

        const { email, password, schoolCode } = credentials;

        if (!schoolCode || schoolCode.trim().length === 0) return null;

        // 1. Resolve the school from the code
        const [school] = await authDb
          .select()
          .from(schools)
          .where(eq(schools.code, schoolCode.trim().toUpperCase()))
          .limit(1);

        if (!school) return null;

        // 2. Check staff scoped to this school
        const [staffMember] = await authDb
          .select()
          .from(staff)
          .where(and(eq(staff.email, email), eq(staff.schoolId, school.id)))
          .limit(1);

        if (staffMember) {
          const valid = await bcrypt.compare(
            password,
            staffMember.passwordHash,
          );
          if (!valid) return null;
          return {
            id: staffMember.id,
            email: staffMember.email,
            name: staffMember.name,
            role: staffMember.role,
            schoolId: staffMember.schoolId,
            schoolCode: school.code,
            userType: "staff" as const,
          };
        }

        // 3. Check students scoped to this school
        const [student] = await authDb
          .select()
          .from(students)
          .where(
            and(eq(students.email, email), eq(students.schoolId, school.id)),
          )
          .limit(1);

        if (student) {
          const valid = await bcrypt.compare(password, student.passwordHash);
          if (!valid) return null;
          return {
            id: student.id,
            email: student.email,
            name: student.name,
            role: "student" as const,
            schoolId: student.schoolId,
            schoolCode: school.code,
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
        token.schoolCode = (user as { schoolCode: string }).schoolCode;
        token.role = (user as { role: string }).role;
        token.userType = (user as { userType: string }).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.schoolId = token.schoolId as string;
        session.user.schoolCode = token.schoolCode as string;
        session.user.role = token.role as string;
        session.user.userType = token.userType as string;
      }
      return session;
    },
    // Safe redirect: only allow same-origin URLs, otherwise fall back to baseUrl.
    // Role-based routing is handled in the dashboard layout guard, not here.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
