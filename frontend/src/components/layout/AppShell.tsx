"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import PageNavigation from "./PageNavigation";

const PAGE_BACKGROUNDS: Record<string, string> = {
  "/dashboard": "/images/dashboard-bg2.jpg",
  "/upload": "/images/login-bg3.jpg",
  "/prepare": "/images/prepare-bg.jpg",
  "/explore": "/images/explore-bg.jpg",
  "/train": "/images/train-bg.jpg",
  "/results": "/images/results-bg.jpg",
  "/forecast": "/images/forecast-bg2.jpg",
  "/staff": "/images/staff-bg3.jpg",
  "/supply": "/images/supply-bg2.jpg",
  "/actions": "/images/actions-bg2.jpg",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bgImage = PAGE_BACKGROUNDS[pathname] || "/images/hero-bg2.jpg";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="relative flex flex-1 flex-col lg:ml-56">
        {/* Subtle page background image */}
        <div className="pointer-events-none fixed inset-0 lg:left-56">
          <Image src={bgImage} alt="" fill className="object-cover opacity-[0.03]" />
        </div>
        {/* Top spacing for mobile hamburger */}
        <div className="h-14 lg:hidden" />
        <main className="relative flex-1">{children}</main>
        <PageNavigation />
      </div>
    </div>
  );
}
