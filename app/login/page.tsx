import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <form
        action={loginAction}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-soft"
      >
        <h1 className="font-playfair text-3xl text-charcoal">Sign In</h1>
        {params.registered && (
          <p className="text-sm text-green-700">
            Account created. Sign in to continue.
          </p>
        )}
        {params.error && (
          <p className="text-sm text-red-600">Invalid credentials.</p>
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border p-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded border p-3"
        />
        <button
          type="submit"
          className="w-full rounded bg-gold p-3 font-medium text-charcoal"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
