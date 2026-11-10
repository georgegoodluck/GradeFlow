import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { loginAction } from "@/app/actions/auth";

// Static shell — renders immediately
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Dynamic child — waits for request
async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  await connection(); // Tell Next.js 16: this is request-dependent

  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <form
      action={loginAction}
      className="w-full max-w-md space-y-5 rounded-2xl bg-white/5 p-10 shadow-2xl backdrop-blur-xl border border-white/10"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl text-white font-playfair">Sign In</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Welcome back to your grading portal
        </p>
      </div>

      {params.registered && (
        <p className="text-sm text-green-400">
          Account created. Sign in to continue.
        </p>
      )}
      {params.error && (
        <p className="text-sm text-red-400">Invalid credentials.</p>
      )}

      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full rounded-lg bg-white/10 border border-white/10 p-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold transition"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="w-full rounded-lg bg-white/10 border border-white/10 p-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold transition"
      />

      <button
        type="submit"
        className="w-full rounded-lg bg-gold p-4 font-medium text-charcoal hover:bg-[#d4b573] transition shadow-[0_0_15px_rgba(198,166,100,0.3)]"
      >
        Sign In
      </button>
    </form>
  );
}

function LoginSkeleton() {
  return (
    <div className="h-[28rem] w-full max-w-md animate-pulse rounded-2xl bg-white/5 border border-white/10" />
  );
}
