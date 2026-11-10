"use client";

import dynamic from "next/dynamic";

// Lazy load the 3D orb so it doesn't block the initial page load.
// This is only allowed because we are in a Client Component.
const GoldOrb = dynamic(
  () => import("@/components/GoldOrb").then((mod) => mod.GoldOrb),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-[400px] animate-pulse rounded-full bg-charcoal/50" />
    ),
  },
);

export function OrbWrapper() {
  return (
    <div className="w-[800px] h-[800px] translate-x-1/3">
      <GoldOrb />
    </div>
  );
}
