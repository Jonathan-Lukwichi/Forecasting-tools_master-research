/**
 * Layout for all authenticated app pages.
 * Wraps children with the AppShell (sidebar + main content)
 * and ToastProvider for notification support.
 */
import AppShell from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
