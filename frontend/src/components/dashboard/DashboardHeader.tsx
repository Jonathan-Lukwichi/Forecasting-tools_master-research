/**
 * Dashboard header with branding and live badge — healthcare white theme.
 */
"use client";

import HeartbeatLogo from "@/components/ui/HeartbeatLogo";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  userName?: string;
}

export default function DashboardHeader({
  title,
  subtitle,
  userName,
}: DashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-600 to-sky-500 p-6 shadow-sm">
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <HeartbeatLogo size={40} />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-blue-100">{subtitle}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-blue-100">
              Welcome, <span className="text-white font-medium">{userName}</span>
            </span>
          )}
          <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
