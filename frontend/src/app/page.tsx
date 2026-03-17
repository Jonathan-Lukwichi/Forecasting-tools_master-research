"use client";

import Link from "next/link";
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  LineChart,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial gradient orbs */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-cyan-500/20">
            H
          </div>
          <div>
            <div className="text-base font-bold text-white">HealthForecast</div>
            <div className="text-[10px] font-medium tracking-wider text-slate-500">
              AI PLATFORM
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-5 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-medium text-cyan-400">
            Intelligent Hospital Resource Planning
          </span>
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Smarter Hospitals,{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Forecast patient demand, optimize staff schedules, and manage supplies
          with confidence. HealthForecast AI transforms hospital data into
          actionable insights that save time, reduce costs, and improve patient
          care.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
          >
            Launch Dashboard
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.06]"
          >
            Learn More
          </a>
        </div>

        {/* Hero visual — floating dashboard preview */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 p-1 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="rounded-xl bg-slate-900/80 p-6">
              {/* Mock dashboard header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="rounded-md bg-slate-800/80 px-3 py-1 text-[10px] text-slate-500">
                  healthforecast-ai.vercel.app/dashboard
                </div>
                <div />
              </div>
              {/* Mock KPI cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Today's Forecast", value: "142", trend: "+10.9%", color: "text-cyan-400" },
                  { label: "7-Day Total", value: "987", trend: "+10.2%", color: "text-blue-400" },
                  { label: "Peak Day", value: "168", trend: "+31.3%", color: "text-amber-400" },
                  { label: "Staff Coverage", value: "94.5%", trend: "Optimal", color: "text-emerald-400" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg border border-white/[0.06] bg-slate-800/40 p-4"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {kpi.label}
                    </div>
                    <div className={`mt-1 font-mono text-2xl font-bold ${kpi.color}`}>
                      {kpi.value}
                    </div>
                    <div className="mt-1 text-[10px] text-emerald-400">{kpi.trend}</div>
                  </div>
                ))}
              </div>
              {/* Mock chart area */}
              <div className="mt-4 flex h-32 items-end gap-1 rounded-lg border border-white/[0.06] bg-slate-800/30 p-4">
                {[40, 55, 45, 70, 65, 80, 60, 75, 85, 70, 90, 78, 95, 88, 72, 85, 92, 68, 80, 75].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/60 to-cyan-400/60"
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
          {/* Glow effect under the card */}
          <div className="absolute -bottom-8 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[80px]" />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.01]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-white/[0.06] sm:grid-cols-4">
          {[
            { value: "7-Day", label: "Forecast Horizon" },
            { value: "24/7", label: "Real-time Monitoring" },
            { value: "< 5%", label: "Prediction Error" },
            { value: "30%", label: "Cost Reduction" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <div className="font-mono text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Platform Capabilities
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Everything You Need to Manage Hospital Demand
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
            From data ingestion to actionable recommendations — a complete
            end-to-end platform for hospital resource planning.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: "Demand Forecasting",
              description:
                "Predict patient arrivals up to 7 days ahead with high accuracy. Understand trends, seasonality, and patterns in emergency department visits.",
              gradient: "from-blue-500 to-cyan-400",
            },
            {
              icon: Users,
              title: "Staff Optimization",
              description:
                "Generate optimal staff schedules that balance coverage, costs, and employee preferences. Minimize overtime while ensuring patient safety.",
              gradient: "from-cyan-500 to-teal-400",
            },
            {
              icon: BarChart3,
              title: "Data Exploration",
              description:
                "Visualize distributions, correlations, and temporal patterns in your data. Understand what drives demand before making decisions.",
              gradient: "from-indigo-500 to-blue-400",
            },
            {
              icon: Brain,
              title: "AI-Powered Insights",
              description:
                "Receive intelligent recommendations tailored to your hospital's specific situation. Actionable advice prioritized by impact.",
              gradient: "from-violet-500 to-purple-400",
            },
            {
              icon: Shield,
              title: "Supply Management",
              description:
                "Optimize inventory levels, reduce waste, and prevent stockouts of critical medical supplies. Smart reorder alerts keep you prepared.",
              gradient: "from-emerald-500 to-green-400",
            },
            {
              icon: Activity,
              title: "Real-time Dashboard",
              description:
                "Monitor key performance indicators at a glance. Track forecasts, model performance, staff coverage, and supply levels in one place.",
              gradient: "from-amber-500 to-orange-400",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} shadow-lg`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.01] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              How It Works
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              From Raw Data to Actionable Plans
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
              A streamlined pipeline that transforms your hospital data into
              optimized schedules and forecasts in minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                step: "01",
                icon: Clock,
                title: "Upload",
                desc: "Import your historical patient, weather, and calendar data",
              },
              {
                step: "02",
                icon: LineChart,
                title: "Explore",
                desc: "Visualize patterns, seasonality, and correlations in your data",
              },
              {
                step: "03",
                icon: Brain,
                title: "Train",
                desc: "Build and compare multiple forecasting models automatically",
              },
              {
                step: "04",
                icon: Calendar,
                title: "Forecast",
                desc: "Generate 7-day predictions with confidence intervals",
              },
              {
                step: "05",
                icon: Zap,
                title: "Optimize",
                desc: "Create optimal staff schedules and supply orders instantly",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative flex flex-col items-center px-4 py-6 text-center">
                  {/* Connector line */}
                  {i < 4 && (
                    <div className="absolute right-0 top-14 hidden h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent lg:block" />
                  )}
                  <div className="mb-3 text-[10px] font-bold tracking-widest text-cyan-400/60">
                    STEP {item.step}
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-slate-900">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Why HealthForecast AI
            </div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Built for Hospital Decision Makers
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Whether you are a hospital administrator, nursing director, or
              operations manager — HealthForecast AI gives you the insights you
              need to make better decisions, faster.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: Heart,
                  title: "Improve Patient Care",
                  desc: "Ensure the right staff and supplies are available when patients need them most.",
                },
                {
                  icon: TrendingUp,
                  title: "Reduce Operational Costs",
                  desc: "Minimize overtime, prevent overstocking, and eliminate inefficiencies in resource allocation.",
                },
                {
                  icon: Shield,
                  title: "Data-Driven Confidence",
                  desc: "Every forecast comes with prediction intervals so you can plan for best and worst case scenarios.",
                },
              ].map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                      <Icon size={16} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{benefit.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="space-y-3">
              {[
                { label: "Forecast Accuracy", value: 96, color: "bg-cyan-400" },
                { label: "Staff Coverage", value: 94, color: "bg-blue-500" },
                { label: "Supply Service Level", value: 98, color: "bg-emerald-400" },
                { label: "Cost Efficiency", value: 87, color: "bg-amber-400" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-white/[0.04] bg-slate-900/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{metric.label}</span>
                    <span className="font-mono text-sm font-bold text-white">{metric.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div
                      className={`h-1.5 rounded-full ${metric.color} transition-all`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-indigo-600/10 px-8 py-16 text-center">
          {/* Glow */}
          <div className="absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />

          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Your Hospital Operations?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
            Start forecasting patient demand, optimizing schedules, and making
            data-driven decisions today.
          </p>
          <Link
            href="/login"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-10 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
          >
            Get Started Now
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 text-[10px] font-black text-white">
              H
            </div>
            <span className="text-xs text-slate-600">
              HealthForecast AI — Master Thesis Prototype
            </span>
          </div>
          <div className="text-xs text-slate-700">&copy; 2026</div>
        </div>
      </footer>
    </div>
  );
}
