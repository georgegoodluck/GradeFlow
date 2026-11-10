"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  const handleSignOut = async () => {
    // 1. Clear all localStorage (drafts, etc.)
    localStorage.clear();
    // 2. Clear session storage
    sessionStorage.clear();

    // 3. Sign out via Auth.js
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center gap-3 text-sm text-gray-400 transition hover:text-white"
    >
      Sign Out
    </button>
  );
}
