import { Suspense } from "react";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { loginAction } from "@/app/actions/auth";
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
  // REMOVE the session check here.
  // The proxy will catch logged-in users and redirect them before
  // this component even renders.

  const params = await searchParams;
  const schoolCode = params.schoolCode;

  // Step 1: Ask for School Code
  if (!schoolCode) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-soft sm:p-10">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl text-charcoal">
            Find Your School
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your school code to access your portal
          </p>
        </div>
        <form action="/login" method="GET" className="space-y-4">
          <input
            name="schoolCode"
            placeholder="School Code (e.g. GDF-RA-48291)"
            required
            className="w-full rounded border p-3 uppercase placeholder:normal-case focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded bg-gold p-3 font-medium text-charcoal hover:bg-[#d4b573] transition"
          >
            Continue
          </button>
        </form>
        <div className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-gold hover:underline">
            Register a school
          </a>
        </div>
      </div>
    );
  }

  // Step 2: Code exists, show login form
  const [school] = await db
    .select({ name: schools.name })
    .from(schools)
    .where(eq(schools.code, schoolCode))
    .limit(1);

  if (!school) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-soft text-center">
        <h2 className="font-playfair text-2xl text-red-600">
          School Not Found
        </h2>
        <p className="text-sm text-gray-500">
          The code {schoolCode} does not match any registered school.
        </p>
        <a
          href="/login"
          className="inline-block mt-4 rounded bg-gold px-6 py-2 text-charcoal"
        >
          Try Again
        </a>
      </div>
    );
  }

  return (
    <form
      action={loginAction}
      className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-soft sm:p-10"
    >
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl text-charcoal">{school.name}</h1>
        <p className="text-sm text-gray-500 mt-2">Sign in to your portal</p>
      </div>

      {params.registered && (
        <div className="rounded bg-green-50 p-4 text-sm text-green-700">
          School registered successfully! Please sign in.
        </div>
      )}

      {params.error === "CredentialsSignin" && (
        <p className="text-sm text-red-600 text-center">
          Invalid email or password.
        </p>
      )}

      <input type="hidden" name="schoolCode" value={schoolCode} />

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
        <a href="/login" className="text-gold hover:underline">
          Wrong school? Change code
        </a>
      </div>
    </form>
  );
}
