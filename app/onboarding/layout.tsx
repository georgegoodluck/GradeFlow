import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ONBOARDING_STEPS } from "./steps";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg space-y-8 py-16">
      <div className="flex gap-2">
        {ONBOARDING_STEPS.map((step) => (
          <div key={step.id} className="h-2 flex-1 rounded bg-gray-200" />
        ))}
      </div>
      {children}
    </div>
  );
}
