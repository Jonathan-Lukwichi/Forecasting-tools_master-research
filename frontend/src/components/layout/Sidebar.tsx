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
} from "lucide-react";
import { clearToken } from "@/lib/api";
import { useRouter } from "next/navigation";

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

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="border-b border-slate-100 px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 text-sm font-black text-white shadow-md shadow-blue-200">
            H
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">HealthForecast</div>
            <div className="text-[10px] font-medium text-slate-400">AI Platform</div>
          </div>
        </Link>
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
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent"
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
    </aside>
  );
}
