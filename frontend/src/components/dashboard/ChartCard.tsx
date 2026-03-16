/**
 * Reusable chart card wrapper with Figma-style dark card.
 */
"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  icon,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 via-slate-900/95 to-slate-800/80 p-5 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -left-full top-0 h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      </div>
      <h3 className="relative mb-4 text-sm font-bold text-white">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <div className="relative">{children}</div>
    </div>
  );
}
