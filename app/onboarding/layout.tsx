import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { ONBOARDING_STEPS } from "./steps";

// Static shell
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-16">
      <div className="flex gap-2">
        {ONBOARDING_STEPS.map((step) => (
          <div key={step.id} className="h-2 flex-1 rounded bg-gray-200" />
        ))}
      </div>
      <Suspense fallback={<OnboardingSkeleton />}>
        <OnboardingGuard>{children}</OnboardingGuard>
      </Suspense>
    </div>
  );
}

// Dynamic child
async function OnboardingGuard({ children }: { children: React.ReactNode }) {
  await connection(); // Fixes the crypto error by making this request-bound

  const session = await auth();
  if (!session?.user) redirect("/login");

  return <>{children}</>;
}

function OnboardingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-3/4 rounded bg-gray-200" />
      <div className="h-12 w-full rounded bg-gray-200" />
      <div className="h-12 w-1/3 rounded bg-gray-200" />
    </div>
  );
}
