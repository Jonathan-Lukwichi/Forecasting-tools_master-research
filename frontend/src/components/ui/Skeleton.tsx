"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Skeleton className="mb-4 h-11 w-11 rounded-xl" />
      <Skeleton className="mb-2 h-5 w-32" />
      <Skeleton className="mb-1 h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function SkeletonKpiCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <Skeleton className="mb-3 h-3 w-24" />
      <Skeleton className="mb-2 h-8 w-20" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Skeleton className="mb-4 h-4 w-40" />
      <div className="flex items-end gap-1 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Skeleton className="mb-4 h-4 w-32" />
      <div className="space-y-3">
        <div className="flex gap-4">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100 p-6 sm:p-8" style={{ minHeight: 120 }}>
      <div className="flex items-center gap-5">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="flex-1">
          <div className="mb-2 h-3 w-16 rounded bg-slate-200" />
          <div className="mb-2 h-6 w-48 rounded bg-slate-200" />
          <div className="h-3 w-64 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SkeletonPageHeader />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SkeletonKpiCard />
          <SkeletonKpiCard />
          <SkeletonKpiCard />
          <SkeletonKpiCard />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    </div>
  );
}
