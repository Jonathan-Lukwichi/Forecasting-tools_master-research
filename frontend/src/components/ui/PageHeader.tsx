"use client";

import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  accentColor?: "blue" | "sky" | "red" | "emerald" | "amber" | "violet" | "indigo";
}

const ACCENT_MAP = {
  blue: {
    gradient: "from-blue-600 to-sky-400",
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    blob1: "bg-blue-100/40",
    blob2: "bg-sky-100/30",
  },
  sky: {
    gradient: "from-sky-500 to-cyan-400",
    badge: "bg-sky-50 text-sky-600 border-sky-200",
    iconBg: "bg-sky-50",
    iconText: "text-sky-600",
    blob1: "bg-sky-100/40",
    blob2: "bg-cyan-100/30",
  },
  red: {
    gradient: "from-red-500 to-rose-400",
    badge: "bg-red-50 text-red-600 border-red-200",
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    blob1: "bg-red-100/40",
    blob2: "bg-rose-100/30",
  },
  emerald: {
    gradient: "from-emerald-500 to-green-400",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    blob1: "bg-emerald-100/40",
    blob2: "bg-green-100/30",
  },
  amber: {
    gradient: "from-amber-500 to-orange-400",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    blob1: "bg-amber-100/40",
    blob2: "bg-orange-100/30",
  },
  violet: {
    gradient: "from-violet-500 to-purple-400",
    badge: "bg-violet-50 text-violet-600 border-violet-200",
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    blob1: "bg-violet-100/40",
    blob2: "bg-purple-100/30",
  },
  indigo: {
    gradient: "from-indigo-500 to-blue-400",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-200",
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    blob1: "bg-indigo-100/40",
    blob2: "bg-blue-100/30",
  },
};

export default function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  accentColor = "blue",
}: PageHeaderProps) {
  const accent = ACCENT_MAP[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-[80px]">
        <div className={`h-full w-full rounded-full ${accent.blob1}`} />
      </div>
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-[60px]">
        <div className={`h-full w-full rounded-full ${accent.blob2}`} />
      </div>

      {/* Medical cross pattern (subtle) */}
      <div className="pointer-events-none absolute right-6 top-6 opacity-[0.04] sm:right-10 sm:top-6">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect x="45" y="10" width="30" height="100" rx="4" fill="currentColor" className="text-slate-900" />
          <rect x="10" y="45" width="100" height="30" rx="4" fill="currentColor" className="text-slate-900" />
        </svg>
      </div>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent.gradient} shadow-md`}>
          <Icon size={24} className="text-white" />
        </div>

        <div className="flex-1">
          {badge && (
            <span className={`mb-2 inline-block rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${accent.badge}`}>
              {badge}
            </span>
          )}
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
