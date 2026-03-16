/**
 * Layout for all authenticated app pages.
 * Wraps children with the AppShell (sidebar + main content).
 */
import AppShell from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
