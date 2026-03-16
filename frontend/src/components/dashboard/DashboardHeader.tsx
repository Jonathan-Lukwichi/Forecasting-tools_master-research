/**
 * Dashboard header with branding and live badge.
 */
"use client";

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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 via-slate-900/95 to-slate-800/80 p-6">
      {/* Shimmer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-full top-0 h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xl font-extrabold text-white shadow-lg shadow-cyan-500/20">
            H
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-slate-400">
              Welcome, <span className="text-slate-200">{userName}</span>
            </span>
          )}
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_theme(colors.cyan.400)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
