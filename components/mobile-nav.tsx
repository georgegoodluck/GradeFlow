"use client";

import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav({ title = "Grading SaaS" }: { title?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Full Screen Fixed Wrapper */}
      <div
        className={`fixed inset-0 z-[60] flex md:hidden ${
          isOpen ? "visible" : "invisible delay-300"
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          className={`relative z-[70] flex w-64 max-w-[80%] flex-col bg-charcoal p-6 text-white transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <h1 className="font-playfair text-xl text-gold">{title}</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <SidebarNav onNavigate={() => setIsOpen(false)} />

          <div className="mt-auto border-t border-white/10 pt-6">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-3 text-sm text-gray-400 transition hover:text-white"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
