/**
 * Login page — authenticates against FastAPI backend.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-2xl font-extrabold text-white shadow-lg shadow-cyan-500/20">
            H
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            HealthForecast AI
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Hospital demand forecasting
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.08] bg-slate-900/80 p-6"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 w-full rounded-lg border border-white/[0.08] bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
            placeholder="admin"
            required
          />

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 w-full rounded-lg border border-white/[0.08] bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Demo: admin / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
