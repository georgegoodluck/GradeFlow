import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

async function authenticate(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=${error.type}`);
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal">
      <form
        action={authenticate}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-soft"
      >
        <h1 className="font-playfair text-3xl text-gold">Sign In</h1>
        {params.error && (
          <p className="text-red-500 text-sm">Invalid credentials</p>
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
          className="w-full rounded bg-gold p-3 font-inter text-charcoal"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
