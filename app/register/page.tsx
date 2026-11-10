import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { registerOwner } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

// Static shell — renders immediately
export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <Suspense fallback={<RegisterSkeleton />}>
        <RegisterForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Dynamic child — waits for request
async function RegisterForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection(); // Tell Next.js 16: this is request-dependent

  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <form
      action={registerOwner}
      className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-soft"
    >
      <h1 className="font-playfair text-3xl text-charcoal text-center mb-6">
        Register School
      </h1>

      {params.error === "exists" && (
        <p className="text-sm text-red-600 text-center">
          Email already registered.
        </p>
      )}
      {params.error === "invalid" && (
        <p className="text-sm text-red-600 text-center">
          Please fill every field (password ≥ 6 chars).
        </p>
      )}
      {params.error === "code_failed" && (
        <p className="text-sm text-red-600 text-center">
          Could not generate a unique school code. Please try a different school
          name.
        </p>
      )}

      <input
        name="schoolName"
        placeholder="School Name"
        required
        className="w-full rounded border p-3 focus:border-gold focus:outline-none"
      />
      <input
        name="name"
        placeholder="Your Full Name"
        required
        className="w-full rounded border p-3 focus:border-gold focus:outline-none"
      />
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
        minLength={6}
        className="w-full rounded border p-3 focus:border-gold focus:outline-none"
      />

      <SubmitButton className="w-full">Create Account</SubmitButton>
    </form>
  );
}

function RegisterSkeleton() {
  return (
    <div className="h-[26rem] w-full max-w-md animate-pulse rounded-2xl bg-white/10" />
  );
}
