"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { login, healthCheck } from "@/lib/api";
import { ArrowLeft, Loader2, Server, Wifi } from "lucide-react";
import HeartbeatLogo from "@/components/ui/HeartbeatLogo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "waking" | "offline">("checking");

  // Check server status on page load — warms up the API
  useEffect(() => {
    let cancelled = false;
    async function checkServer() {
      setServerStatus("checking");
      try {
        await healthCheck();
        if (!cancelled) setServerStatus("online");
      } catch {
        if (!cancelled) {
          setServerStatus("waking");
          // Retry after a few seconds — server is cold starting
          setTimeout(async () => {
            try {
              await healthCheck();
              if (!cancelled) setServerStatus("online");
            } catch {
              if (!cancelled) setServerStatus("offline");
            }
          }, 15000);
        }
      }
    }
    checkServer();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    checking: { text: "Connecting to server...", color: "text-amber-500", icon: Loader2, animate: true },
    waking: { text: "Server is waking up — please wait ~30s...", color: "text-amber-500", icon: Server, animate: true },
    online: { text: "Server online", color: "text-emerald-500", icon: Wifi, animate: false },
    offline: { text: "Server unavailable — try again later", color: "text-red-500", icon: Server, animate: false },
  };

  const status = statusConfig[serverStatus];
  const StatusIcon = status.icon;

  return (
    <div className="flex min-h-screen">
      {/* Left panel — image (hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <Image src="/images/login-bg2.jpg" alt="Healthcare technology" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-blue-800/70 to-sky-900/60" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-3">
            <HeartbeatLogo size={40} />
            <div>
              <div className="text-lg font-bold text-white">HealthForecast AI</div>
              <div className="text-xs text-blue-200">Hospital Resource Planning</div>
            </div>
          </Link>
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Smarter decisions.<br />Better patient outcomes.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100/80">
              AI-powered forecasting and optimization platform for South African hospitals. Predict demand, plan staff, and manage supplies with confidence.
            </p>
            <div className="mt-6 opacity-30">
              <svg viewBox="0 0 400 40" fill="none" className="h-8 w-64">
                <path d="M0 20h80l15-16 20 32 15-16 20 32 15-16h80l15-16 20 32 15-16h80" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-blue-200/60">&copy; 2026 HealthForecast AI — Master Thesis Prototype</div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center bg-slate-50 px-6 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile header image */}
          <div className="relative -mx-6 -mt-8 mb-8 h-40 overflow-hidden rounded-b-3xl sm:-mx-12 lg:hidden">
            <Image src="/images/login-bg2.jpg" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-900/90" />
            <div className="relative flex h-full items-end p-6">
              <div className="flex items-center gap-3">
                <HeartbeatLogo size={36} className="shadow-lg" />
                <div className="text-base font-bold text-white">HealthForecast AI</div>
              </div>
            </div>
          </div>

          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-blue-600">
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Server status indicator */}
            <div className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
              serverStatus === "online"
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : serverStatus === "offline"
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-amber-200 bg-amber-50 text-amber-600"
            }`}>
              <StatusIcon size={14} className={status.animate ? "animate-spin" : ""} />
              {status.text}
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
            )}

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" placeholder="admin" required />

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-6 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" placeholder="••••••••" required />

            <button type="submit" disabled={loading || serverStatus === "offline"} className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:shadow-lg disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in — please wait...
                </span>
              ) : "Sign in"}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">Demo: admin / admin123</p>
          </form>
        </div>
      </div>
    </div>
  );
}
