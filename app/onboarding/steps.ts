export const ONBOARDING_STEPS = [
  { id: "school", label: "School Details", path: "/onboarding/school" },
  { id: "term", label: "First Term", path: "/onboarding/term" },
  { id: "classes", label: "Classes", path: "/onboarding/classes" },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]["id"];
