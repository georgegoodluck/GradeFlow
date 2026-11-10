import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";
import { auth } from "@/auth";
import { loginAction } from "@/app/actions/auth";

export default function TenantLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-6">
      <Suspense
        fallback={
          <div className="h-[28rem] w-full max-w-md animate-pulse rounded-2xl bg-white/5 border border-white/10" />
        }
      >
        <TenantLoginForm params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function TenantLoginForm({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  await connection();

  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const { slug } = await params;
  const query = await searchParams;

  // Fetch school by slug
  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.slug, slug))
    .limit(1);
  if (!school) notFound();

  return (
    <form
      action={loginAction}
      className="w-full max-w-md space-y-5 rounded-2xl bg-white/5 p-10 shadow-2xl backdrop-blur-xl border border-white/10"
    >
      <div className="text-center mb-8">
        {school.logoUrl && (
          <img
            src={school.logoUrl}
            alt="Logo"
            className="mx-auto h-16 w-16 mb-4 object-contain rounded-md"
          />
        )}
        <h1 className="text-4xl text-white font-playfair">{school.name}</h1>
        <p className="text-gray-400 mt-2 text-sm">Sign in to your portal</p>
      </div>

      {/* THIS IS THE CRITICAL LINE */}
      <input type="hidden" name="schoolSlug" value={school.slug} />

      {query.registered && (
        <p className="text-sm text-green-400">
          Account created. Sign in to continue.
        </p>
      )}
      {query.error && (
        <p className="text-sm text-red-400">
          Invalid credentials. Please try again.
        </p>
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
