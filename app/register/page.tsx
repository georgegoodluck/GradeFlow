import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { registerOwner } from "@/app/actions/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <form
        action={registerOwner}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-soft"
      >
        <h1 className="font-playfair text-3xl text-charcoal">Create Account</h1>
        {params.error === "exists" && (
          <p className="text-sm text-red-600">Email already registered.</p>
        )}
        {params.error === "invalid" && (
          <p className="text-sm text-red-600">
            Please fill every field (password ≥ 6 chars).
          </p>
        )}
        <input
          name="schoolName"
          placeholder="School name"
          required
          className="w-full rounded border p-3"
        />
        <input
          name="name"
          placeholder="Your full name"
          required
          className="w-full rounded border p-3"
        />
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
          minLength={6}
          className="w-full rounded border p-3"
        />
        <button
          type="submit"
          className="w-full rounded bg-gold p-3 font-medium text-charcoal"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
