"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "danger" | "ghost";
}

export function SubmitButton({ children, className = "", variant = "primary" }: Props) {
  const { pending } = useFormStatus();

  const base = "inline-flex items-center justify-center rounded px-6 py-3 font-medium transition disabled:opacity-50 cursor-pointer";
  const variants = {
    primary: "bg-gold text-charcoal hover:bg-[#d4b573]",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-charcoal hover:bg-gray-100",
  };

  return (
    <button type="submit" disabled={pending} className={`${base} ${variants[variant]} ${className}`}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
