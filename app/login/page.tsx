import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { loginAction, findSchoolAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    schoolCode?: string;
    registered?: string;
  }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <Suspense
        fallback={
          <div className="h-[400px] w-full max-w-md animate-pulse rounded-lg bg-white/10" />
        }
      >
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    schoolCode?: string;
    registered?: string;
  }>;
}) {
  await connection();
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;
  const schoolCode = params.schoolCode;
  const hasCode = typeof schoolCode === "string" && schoolCode.length > 0;

  // STEP 1: No school code yet → show the "find your school" form
  if (!hasCode) {
    return (
      <form
        action={findSchoolAction}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-soft sm:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl text-charcoal">
            Find Your School
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your school code to access your portal
          </p>
        </div>

        {params.error === "not_found" && (
          <p className="text-sm text-red-600 text-center">
            School code not found. Please try again.
          </p>
        )}
        {params.error === "invalid" && (
          <p className="text-sm text-red-600 text-center">
            Please enter a school code.
          </p>
        )}

        <input
          name="code"
          placeholder="School Code (e.g. GDF-RA-48291)"
          required
          className="w-full rounded border p-3 uppercase placeholder:normal-case focus:border-gold focus:outline-none"
        />

        <SubmitButton className="w-full mt-2">Continue</SubmitButton>

        <div className="text-center pt-4 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-gold hover:underline">
            Register a school
          </a>
        </div>
      </form>
    );
  }

  // STEP 2: We have a school code → fetch the school name, then show credentials
  const [school] = await db
    .select({ name: schools.name })
    .from(schools)
    .where(eq(schools.code, schoolCode.toUpperCase()))
    .limit(1);

  const schoolName = school?.name ?? null;

  return (
    <form
      action={loginAction}
      className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-soft sm:p-10"
    >
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl text-charcoal">
          {schoolName ?? "Welcome Back"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Sign in to your school portal
        </p>
      </div>

      {params.registered && (
        <div className="rounded bg-green-50 p-4 text-sm text-green-700">
          School registered successfully! Please sign in.
        </div>
      )}

      {/* Code display — hidden field carries the value; banner confirms the tenant */}
      <input type="hidden" name="schoolCode" value={schoolCode} />
      <div className="rounded bg-gold/10 border border-gold p-4 text-sm">
        <p className="font-medium text-charcoal">School code:</p>
        <p className="mt-1 font-mono text-lg font-bold text-gold">
          {schoolCode}
        </p>
        <a href="/login" className="text-gold text-xs hover:underline">
          Change
        </a>
      </div>

      {params.error === "CredentialsSignin" && (
        <p className="text-sm text-red-600 text-center">
          Invalid email or password.
        </p>
      )}
      {params.error === "invalid" && (
        <p className="text-sm text-red-600 text-center">
          Please fill in all fields.
        </p>
      )}

      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full rounded border p-3 focus:border-gold focus:outline-none"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="w-full rounded border p-3 focus:border-gold focus:outline-none"
      />

      <SubmitButton className="w-full mt-2">Sign In</SubmitButton>

      <div className="text-center pt-4 text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-gold hover:underline">
          Register a school
        </a>
      </div>
    </form>
  );
}
