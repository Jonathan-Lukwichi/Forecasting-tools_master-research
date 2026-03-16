/**
 * App shell layout — sidebar + main content area.
 * Used by all authenticated pages.
 */
"use client";

import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-56 flex-1">{children}</main>
    </div>
  );
}
