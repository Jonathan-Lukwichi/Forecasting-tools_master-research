"use client";

import Sidebar from "./Sidebar";
import PageNavigation from "./PageNavigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-56 flex flex-1 flex-col">
        <main className="flex-1">{children}</main>
        <PageNavigation />
      </div>
    </div>
  );
}
