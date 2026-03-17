"use client";

import Sidebar from "./Sidebar";
import PageNavigation from "./PageNavigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-56">
        {/* Top spacing for mobile hamburger */}
        <div className="h-14 lg:hidden" />
        <main className="flex-1">{children}</main>
        <PageNavigation />
      </div>
    </div>
  );
}
