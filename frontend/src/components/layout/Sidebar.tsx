"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Upload,
  Layers,
  BarChart3,
  Cpu,
  Trophy,
  TrendingUp,
  Users,
  Package,
  Zap,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { clearToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Data", icon: Upload },
  { href: "/prepare", label: "Prepare Data", icon: Layers },
  { href: "/explore", label: "Explore Data", icon: BarChart3 },
  { href: "/train", label: "Train Models", icon: Cpu },
  { href: "/results", label: "Model Results", icon: Trophy },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/staff", label: "Staff Planner", icon: Users },
  { href: "/supply", label: "Supply Planner", icon: Package },
  { href: "/actions", label: "Action Center", icon: Zap },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="border-b border-slate-100 px-4 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 text-sm font-black text-white shadow-md shadow-blue-200">
              H
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">HealthForecast</div>
              <div className="text-[10px] font-medium text-slate-400">AI Platform</div>
            </div>
          </Link>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Home link */}
      <div className="border-b border-slate-100 px-3 py-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700"
        >
          <Home size={16} className="text-slate-400" />
          Welcome Page
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Workflow
        </div>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "border border-blue-100 bg-blue-50 text-blue-700"
                    : "border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon
                  size={16}
                  className={active ? "text-blue-600" : "text-slate-400"}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          Sign Out
        </button>
        <div className="mt-2 px-3">
          <div className="text-[10px] text-slate-400">HealthForecast AI v1.0</div>
          <div className="text-[10px] text-slate-300">Master Thesis Prototype</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — mobile (slide-in) */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar — desktop (fixed) */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
