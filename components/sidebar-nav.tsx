// components/sidebar-nav.tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/classes", label: "Classes" },
  { href: "/dashboard/subjects", label: "Subjects" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/students", label: "Students" },
  { href: "/dashboard/assignments", label: "Assignments" },
  { href: "/dashboard/terms", label: "Terms" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-8 space-y-3 text-sm">
      {adminLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block transition ${isActive ? "text-gold font-medium" : "hover:text-gold text-gray-300"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
