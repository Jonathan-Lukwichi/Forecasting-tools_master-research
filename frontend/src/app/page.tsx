"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-sky-100/50 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-red-50/40 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-base font-black text-white shadow-md shadow-blue-200 sm:h-10 sm:w-10 sm:text-lg">
            H
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 sm:text-base">HealthForecast</div>
            <div className="hidden text-[10px] font-medium tracking-wider text-slate-400 sm:block">
              AI PLATFORM
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 sm:px-5"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:shadow-blue-300 sm:px-5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-20 sm:pt-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 sm:mb-8"
        >
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-blue-600">
            Intelligent Hospital Resource Planning
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-4xl text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-7xl"
        >
          Smarter Hospitals,{" "}
          <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-400 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:mt-6 sm:text-lg"
        >
          Forecast patient demand, optimize staff schedules, and manage supplies
          with confidence. HealthForecast AI transforms hospital data into
          actionable insights that save time, reduce costs, and improve patient care.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
        >
          <Link
            href="/login"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:shadow-blue-300 sm:w-auto"
          >
            Launch Dashboard
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#features"
            className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
          >
            Learn More
          </a>
        </motion.div>

        {/* Hero visual — floating dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto mt-12 max-w-5xl sm:mt-16"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-200/50">
            <div className="rounded-xl bg-slate-50 p-4 sm:p-6">
              {/* Mock dashboard header */}
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="hidden rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-400 sm:block">
                  healthforecast-ai.vercel.app/dashboard
                </div>
                <div />
              </div>
              {/* Mock KPI cards */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {[
                  { label: "Today's Forecast", value: "142", trend: "+10.9%", color: "text-blue-600" },
                  { label: "7-Day Total", value: "987", trend: "+10.2%", color: "text-sky-500" },
                  { label: "Peak Day", value: "168", trend: "+31.3%", color: "text-red-500" },
                  { label: "Staff Coverage", value: "94.5%", trend: "Optimal", color: "text-emerald-500" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4"
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                      {kpi.label}
                    </div>
                    <div className={`mt-1 font-mono text-lg font-bold sm:text-2xl ${kpi.color}`}>
                      {kpi.value}
                    </div>
                    <div className="mt-1 text-[10px] text-emerald-500">{kpi.trend}</div>
                  </div>
                ))}
              </div>
              {/* Mock chart area */}
              <div className="mt-3 flex h-20 items-end gap-0.5 rounded-lg border border-slate-200 bg-white p-3 sm:mt-4 sm:h-32 sm:gap-1 sm:p-4">
                {[40, 55, 45, 70, 65, 80, 60, 75, 85, 70, 90, 78, 95, 88, 72, 85, 92, 68, 80, 75].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-blue-500 to-sky-300"
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -bottom-8 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-blue-100/40 blur-[60px]" />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
          {[
            { value: "7-Day", label: "Forecast Horizon" },
            { value: "24/7", label: "Real-time Monitoring" },
            { value: "< 5%", label: "Prediction Error" },
            { value: "30%", label: "Cost Reduction" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center sm:px-6 sm:py-8">
              <div className="font-mono text-xl font-bold text-slate-800 sm:text-2xl">{stat.value}</div>
              <div className="mt-1 text-[10px] text-slate-400 sm:text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 sm:mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">
            Everything You Need to Manage Hospital Demand
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:mt-4">
            From data ingestion to actionable recommendations — a complete
            end-to-end platform for hospital resource planning.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              icon: TrendingUp,
              title: "Demand Forecasting",
              description:
                "Predict patient arrivals up to 7 days ahead with high accuracy. Understand trends, seasonality, and patterns in emergency department visits.",
              color: "from-blue-600 to-sky-400",
              shadow: "shadow-blue-100",
            },
            {
              icon: Users,
              title: "Staff Optimization",
              description:
                "Generate optimal staff schedules that balance coverage, costs, and employee preferences. Minimize overtime while ensuring patient safety.",
              color: "from-sky-500 to-cyan-400",
              shadow: "shadow-sky-100",
            },
            {
              icon: BarChart3,
              title: "Data Exploration",
              description:
                "Visualize distributions, correlations, and temporal patterns in your data. Understand what drives demand before making decisions.",
              color: "from-indigo-500 to-blue-400",
              shadow: "shadow-indigo-100",
            },
            {
              icon: Brain,
              title: "AI-Powered Insights",
              description:
                "Receive intelligent recommendations tailored to your hospital's specific situation. Actionable advice prioritized by impact.",
              color: "from-violet-500 to-purple-400",
              shadow: "shadow-violet-100",
            },
            {
              icon: Shield,
              title: "Supply Management",
              description:
                "Optimize inventory levels, reduce waste, and prevent stockouts of critical medical supplies. Smart reorder alerts keep you prepared.",
              color: "from-red-500 to-rose-400",
              shadow: "shadow-red-100",
            },
            {
              icon: Activity,
              title: "Real-time Dashboard",
              description:
                "Monitor key performance indicators at a glance. Track forecasts, model performance, staff coverage, and supply levels in one place.",
              color: "from-emerald-500 to-green-400",
              shadow: "shadow-emerald-100",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-6"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} shadow-md ${feature.shadow}`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative z-10 border-y border-slate-200 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 sm:mb-4">
              How It Works
            </div>
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">
              From Raw Data to Actionable Plans
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:mt-4">
              A streamlined pipeline that transforms your hospital data into
              optimized schedules and forecasts in minutes.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
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
                <div key={item.step} className="relative flex flex-col items-center px-2 py-4 text-center sm:px-4 sm:py-6">
                  {/* Connector line */}
                  {i < 4 && (
                    <div className="absolute right-0 top-14 hidden h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block" />
                  )}
                  <div className="mb-2 text-[10px] font-bold tracking-widest text-blue-400 sm:mb-3">
                    STEP {item.step}
                  </div>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 bg-blue-50 sm:mb-4 sm:h-12 sm:w-12">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:text-xs">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 sm:mb-4">
              Why HealthForecast AI
            </div>
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">
              Built for Hospital Decision Makers
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:mt-4">
              Whether you are a hospital administrator, nursing director, or
              operations manager — HealthForecast AI gives you the insights you
              need to make better decisions, faster.
            </p>

            <div className="mt-6 space-y-4 sm:mt-8">
              {[
                {
                  icon: Heart,
                  title: "Improve Patient Care",
                  desc: "Ensure the right staff and supplies are available when patients need them most.",
                  color: "text-red-500 bg-red-50 border-red-100",
                },
                {
                  icon: TrendingUp,
                  title: "Reduce Operational Costs",
                  desc: "Minimize overtime, prevent overstocking, and eliminate inefficiencies in resource allocation.",
                  color: "text-blue-600 bg-blue-50 border-blue-100",
                },
                {
                  icon: Shield,
                  title: "Data-Driven Confidence",
                  desc: "Every forecast comes with prediction intervals so you can plan for best and worst case scenarios.",
                  color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                },
              ].map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="flex gap-4">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${benefit.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{benefit.title}</h3>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="space-y-3">
              {[
                { label: "Forecast Accuracy", value: 96, color: "bg-blue-500" },
                { label: "Staff Coverage", value: 94, color: "bg-sky-500" },
                { label: "Supply Service Level", value: 98, color: "bg-emerald-500" },
                { label: "Cost Efficiency", value: 87, color: "bg-red-400" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">{metric.label}</span>
                    <span className="font-mono text-sm font-bold text-slate-800">{metric.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full ${metric.color} transition-all`}
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
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6 py-12 text-center sm:rounded-3xl sm:px-8 sm:py-16">
          <div className="absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-blue-100/50 blur-[60px]" />

          <h2 className="relative text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">
            Ready to Transform Your Hospital Operations?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:mt-4">
            Start forecasting patient demand, optimizing schedules, and making
            data-driven decisions today.
          </p>
          <Link
            href="/login"
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:shadow-blue-300 sm:mt-8 sm:px-10 sm:py-4"
          >
            Get Started Now
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-slate-50 py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-sky-400 text-[10px] font-black text-white">
              H
            </div>
            <span className="text-xs text-slate-500">
              HealthForecast AI — Master Thesis Prototype
            </span>
          </div>
          <div className="text-xs text-slate-400">&copy; 2026</div>
        </div>
      </footer>
    </div>
  );
}
