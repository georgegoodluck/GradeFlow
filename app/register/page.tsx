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
        className="w-full max-w-md space-y-5 rounded-2xl bg-white/5 p-10 shadow-2xl backdrop-blur-xl border border-white/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl text-white font-playfair">Create Account</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Set up your school's grading portal
          </p>
        </div>

        {params.error === "exists" && (
          <p className="text-sm text-red-400">Email already registered.</p>
        )}
        {params.error === "invalid" && (
          <p className="text-sm text-red-400">
            Please fill every field (password ≥ 6 chars).
          </p>
        )}

        <input
          name="schoolName"
          placeholder="School name"
          required
          className="w-full rounded-lg bg-white/10 border border-white/10 p-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold transition"
        />
        <input
          name="name"
          placeholder="Your full name"
          required
          className="w-full rounded-lg bg-white/10 border border-white/10 p-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold transition"
        />
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
          minLength={6}
          className="w-full rounded-lg bg-white/10 border border-white/10 p-4 text-white placeholder-gray-400 focus:outline-none focus:border-gold transition"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-gold p-4 font-medium text-charcoal hover:bg-[#d4b573] transition shadow-[0_0_15px_rgba(198,166,100,0.3)]"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
