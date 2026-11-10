import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const password = formData.get("password");
  const schoolSlug = formData.get("schoolSlug");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof schoolSlug !== "string"
  ) {
    redirect(`/${schoolSlug || ""}/login?error=invalid`);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      schoolSlug, // Pass this to authorize()
      redirectTo: "/dashboard", // The layout guards will route them correctly
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      redirect(`/${schoolSlug}/login?error=${error.type}`);
    }
    throw error;
  }
}
