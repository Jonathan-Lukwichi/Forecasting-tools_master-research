"use client";

import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  accentColor?: "blue" | "sky" | "red" | "emerald" | "amber" | "violet" | "indigo";
  images?: string[];
}

const ACCENT_MAP = {
  blue: {
    gradient: "from-blue-600 to-sky-400",
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    overlay: "from-blue-900/80 via-blue-900/60 to-sky-900/40",
  },
  sky: {
    gradient: "from-sky-500 to-cyan-400",
    badge: "bg-sky-50 text-sky-600 border-sky-200",
    overlay: "from-sky-900/80 via-sky-900/60 to-cyan-900/40",
  },
  red: {
    gradient: "from-red-500 to-rose-400",
    badge: "bg-red-50 text-red-600 border-red-200",
    overlay: "from-red-900/80 via-red-900/60 to-rose-900/40",
  },
  emerald: {
    gradient: "from-emerald-500 to-green-400",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    overlay: "from-emerald-900/80 via-emerald-900/60 to-green-900/40",
  },
  amber: {
    gradient: "from-amber-500 to-orange-400",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    overlay: "from-amber-900/80 via-amber-900/60 to-orange-900/40",
  },
  violet: {
    gradient: "from-violet-500 to-purple-400",
    badge: "bg-violet-50 text-violet-600 border-violet-200",
    overlay: "from-violet-900/80 via-violet-900/60 to-purple-900/40",
  },
  indigo: {
    gradient: "from-indigo-500 to-blue-400",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-200",
    overlay: "from-indigo-900/80 via-indigo-900/60 to-blue-900/40",
  },
};

export default function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  accentColor = "blue",
  images,
}: PageHeaderProps) {
  const accent = ACCENT_MAP[accentColor];
  const hasImages = images && images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      style={{ minHeight: hasImages ? 180 : undefined }}
    >
      {/* Background image with overlay */}
      {hasImages && (
        <>
          <Image
            src={images[0]}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${accent.overlay}`} />
          {/* Subtle heartbeat line decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10">
            <svg viewBox="0 0 1200 48" fill="none" className="h-full w-full" preserveAspectRatio="none">
              <path
                d="M0 24h200l30-20 40 40 30-20 40 40 30-20h200l30-20 40 40 30-20 40 40 30-20h200l30-20 40 40 30-20h200"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        </>
      )}

      {/* No-image fallback (white card) */}
      {!hasImages && (
        <div className="absolute inset-0 bg-white">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-50/60 blur-[80px]" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-5 sm:p-8">
        {/* Icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${hasImages ? "bg-white/20 backdrop-blur-sm" : `bg-gradient-to-br ${accent.gradient}`} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>

        <div className="flex-1">
          {badge && (
            <span className={`mb-2 inline-block rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${hasImages ? "border-white/30 bg-white/10 text-white/90" : accent.badge}`}>
              {badge}
            </span>
          )}
          <h1 className={`text-xl font-bold sm:text-2xl ${hasImages ? "text-white" : "text-slate-800"}`}>
            {title}
          </h1>
          <p className={`mt-1 text-sm ${hasImages ? "text-white/80" : "text-slate-500"}`}>
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
