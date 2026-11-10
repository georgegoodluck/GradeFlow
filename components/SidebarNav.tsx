"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  School,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  CalendarDays,
  FileText,
  Settings,
  Award,
  PenLine,
} from "lucide-react";

const adminLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/classes", label: "Classes", icon: School },
  { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/students", label: "Students", icon: GraduationCap },
  { href: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/dashboard/terms", label: "Terms", icon: CalendarDays },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const teacherLinks = [
  { href: "/teacher", label: "My Classes", icon: LayoutDashboard },
  { href: "/teacher/scores", label: "Enter Scores", icon: PenLine },
];

const studentLinks = [{ href: "/student", label: "My Results", icon: Award }];

export function SidebarNav() {
  const pathname = usePathname();

  let links = adminLinks;
  if (pathname.startsWith("/teacher")) links = teacherLinks;
  if (pathname.startsWith("/student")) links = studentLinks;

  return (
    <nav className="mt-8 space-y-1 text-sm flex-1 overflow-y-auto">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-white/10 text-gold font-medium"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
