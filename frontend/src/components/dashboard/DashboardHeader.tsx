"use client";

import Image from "next/image";
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ minHeight: 100 }}>
      {/* Background image */}
      <Image
        src="/images/dashboard-bg.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/75 to-sky-900/60" />

      {/* Heartbeat line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-10 opacity-10">
        <svg viewBox="0 0 1200 40" fill="none" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0 20h200l30-16 40 32 30-16 40 32 30-16h200l30-16 40 32 30-16 40 32 30-16h200" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shadow-lg">
            <HeartbeatLogo size={40} className="shadow-none" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{title}</h1>
            <p className="mt-0.5 text-sm text-blue-100/80">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-blue-100/80">
              Welcome, <span className="font-medium text-white">{userName}</span>
            </span>
          )}
          <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
