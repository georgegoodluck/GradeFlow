import { Suspense } from "react";
import { connection } from "next/server";
import { loginAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <Suspense
        fallback={
          <div className="h-[400px] w-full max-w-md animate-pulse rounded-lg bg-white/10" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

async function LoginForm() {
  await connection();

  return (
    <form
      action={loginAction}
      className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-soft sm:p-10"
    >
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl text-charcoal">GradeFlow</h1>
        <p className="text-sm text-gray-500 mt-2">Sign in to your portal</p>
      </div>

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
    </form>
  );
}
