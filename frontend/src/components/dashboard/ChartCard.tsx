/**
 * Reusable chart card wrapper — healthcare white theme.
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
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <h3 className="relative mb-4 text-sm font-bold text-slate-800">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <div className="relative">{children}</div>
    </div>
  );
}
