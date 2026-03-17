"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, LayoutDashboard } from "lucide-react";

const PAGE_ORDER = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload Data" },
  { href: "/prepare", label: "Prepare Data" },
  { href: "/explore", label: "Explore Data" },
  { href: "/train", label: "Train Models" },
  { href: "/results", label: "Model Results" },
  { href: "/forecast", label: "Forecast" },
  { href: "/staff", label: "Staff Planner" },
  { href: "/supply", label: "Supply Planner" },
  { href: "/actions", label: "Action Center" },
];

export default function PageNavigation() {
  const pathname = usePathname();
  const currentIndex = PAGE_ORDER.findIndex((p) => p.href === pathname);

  const prev = currentIndex > 0 ? PAGE_ORDER[currentIndex - 1] : null;
  const next =
    currentIndex < PAGE_ORDER.length - 1 ? PAGE_ORDER[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
      {/* Left — Home + Dashboard */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <Home size={14} />
          Home
        </Link>
        {pathname !== "/dashboard" && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        )}
      </div>

      {/* Right — Previous / Next */}
      <div className="flex items-center gap-2">
        {prev && (
          <Link
            href={prev.href}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <ChevronLeft size={14} />
            {prev.label}
          </Link>
        )}
        {next && (
          <Link
            href={next.href}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            {next.label}
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
