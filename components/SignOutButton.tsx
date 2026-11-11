"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const handleSignOut = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full cursor-pointer items-center gap-3 text-sm text-gray-400 transition hover:text-white"
    >
      <LogOut className="h-4 w-4" /> Sign Out
    </button>
  );
}
