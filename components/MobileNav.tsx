"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { SignOutButton } from "./SignOutButton";

export function MobileNav({ title = "GradeFlow" }: { title?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer p-2 text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className={`fixed inset-0 z-[60] flex md:hidden ${isOpen ? "visible" : "invisible delay-300"}`}>
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />
        <div className={`relative z-[70] flex w-64 max-w-[80%] flex-col bg-charcoal p-6 text-white transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <h1 className="font-playfair text-xl text-gold">{title}</h1>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer p-2 text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <SidebarNav onNavigate={() => setIsOpen(false)} />
          <div className="mt-auto border-t border-white/10 pt-6">
            <SignOutButton />
          </div>
        </div>
      </div>
    </>
  );
}
