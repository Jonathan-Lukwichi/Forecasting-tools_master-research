/**
 * Shared sidebar navigation for all authenticated pages.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
} from "lucide-react";

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

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-white/[0.06] bg-slate-950/95 backdrop-blur-xl">
      {/* Brand */}
      <div className="border-b border-white/[0.06] px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white">
            H
          </div>
          <div>
            <div className="text-sm font-bold text-white">HealthForecast</div>
            <div className="text-[10px] font-medium text-slate-500">AI Platform</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon size={16} className={active ? "text-cyan-400" : "text-slate-500"} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="text-[10px] text-slate-600">HealthForecast AI v1.0</div>
        <div className="text-[10px] text-slate-700">Master Thesis Prototype</div>
      </div>
    </aside>
  );
}
