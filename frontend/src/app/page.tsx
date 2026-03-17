"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import HeartbeatLogo from "@/components/ui/HeartbeatLogo";
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
  visible: () => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  }),
};

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ========== HERO — Dark blue overlay, white readable text ========== */}
      <section className="relative overflow-hidden bg-slate-900">
        <Image src="/images/hero-bg2.jpg" alt="" fill className="object-cover opacity-30" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-blue-900/60 to-slate-900/90" />

        {/* Nav */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <HeartbeatLogo size={40} />
            <div>
              <div className="text-sm font-bold text-white sm:text-base">HealthForecast</div>
              <div className="hidden text-[10px] font-medium tracking-wider text-blue-300 sm:block">AI PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:text-white">Sign in</Link>
            <Link href="/login" className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50">Start Here</Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-16 text-center sm:px-6 sm:pb-36 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-1.5 sm:mb-8">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-blue-200">Intelligent Hospital Resource Planning</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl">
            Smarter Hospitals,{" "}
            <span className="text-cyan-400">Powered by AI</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blue-100 sm:mt-6 sm:text-lg">
            Forecast patient demand, optimize staff schedules, and manage supplies with confidence. HealthForecast AI transforms hospital data into actionable insights that save time, reduce costs, and improve patient care.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link href="/login" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-xl transition-all hover:bg-blue-50 sm:w-auto">
              Start Here <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="w-full rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10 sm:w-auto">Learn More</a>
          </motion.div>

          {/* University affiliation */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="mt-8 text-xs font-medium tracking-wide text-blue-300/60">
            Master Thesis Research — South Africa
          </motion.p>
        </div>
      </section>

      {/* ========== Dashboard Preview — static carousel image ========== */}
      <section className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:-mt-20 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="hidden rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-400 sm:block">healthforecast-ai.vercel.app/dashboard</div>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-semibold text-emerald-600">LIVE</span>
              </div>
            </div>
            <div className="relative h-56 sm:h-72 md:h-80">
              <Image src="/images/carousel-1.jpg" alt="Analytics dashboard" fill className="object-cover" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========== Stats ========== */}
      <section className="mt-16 border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
          {[
            { value: "7-Day", label: "Forecast Horizon" },
            { value: "24/7", label: "Real-time Monitoring" },
            { value: "< 5%", label: "Prediction Error" },
            { value: "30%", label: "Cost Reduction" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-6 text-center sm:px-6 sm:py-8">
              <div className="font-mono text-xl font-bold text-slate-800 sm:text-2xl">{stat.value}</div>
              <div className="mt-1 text-[10px] text-slate-500 sm:text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== Features — clean white, no background image ========== */}
      <section id="features" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Platform Capabilities</div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">Everything You Need to Manage Hospital Demand</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-4">From data ingestion to actionable recommendations — a complete end-to-end platform for hospital resource planning.</p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: TrendingUp, title: "Demand Forecasting", description: "Predict patient arrivals up to 7 days ahead. Understand trends, seasonality, and patterns in emergency department visits.", color: "from-blue-600 to-sky-500", shadow: "shadow-blue-200", core: true },
              { icon: Users, title: "Staff Optimization", description: "Generate optimal staff schedules that balance coverage, costs, and preferences. Minimize overtime while ensuring patient safety.", color: "from-sky-500 to-cyan-400", shadow: "shadow-sky-200", core: true },
              { icon: Shield, title: "Supply Management", description: "Optimize inventory levels, reduce waste, and prevent stockouts. Smart reorder alerts keep you prepared.", color: "from-emerald-600 to-teal-500", shadow: "shadow-emerald-200", core: true },
              { icon: BarChart3, title: "Data Exploration", description: "Visualize distributions, correlations, and temporal patterns. Understand what drives demand before making decisions.", color: "from-indigo-600 to-blue-500", shadow: "shadow-indigo-200", core: false },
              { icon: Brain, title: "AI-Powered Insights", description: "Receive intelligent recommendations tailored to your hospital. Actionable advice prioritized by impact.", color: "from-violet-600 to-purple-500", shadow: "shadow-violet-200", core: false },
              { icon: Activity, title: "Real-time Dashboard", description: "Monitor KPIs at a glance. Track forecasts, model performance, staff coverage, and supply levels.", color: "from-amber-500 to-orange-500", shadow: "shadow-amber-200", core: false },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeUp} className={`group rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${feature.core ? "border-blue-200 bg-blue-50/30 ring-1 ring-blue-100" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-start justify-between">
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg ${feature.shadow}`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    {feature.core && <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Core</span>}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== Workflow — dark section with strong contrast ========== */}
      <section className="relative overflow-hidden bg-slate-900 py-16 sm:py-24">
        <Image src="/images/hero-bg3.jpg" alt="" fill className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-slate-900/80" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-400">How It Works</div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">From Raw Data to Actionable Plans</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:mt-4">A streamlined pipeline that transforms your hospital data into optimized schedules and forecasts in minutes.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:mt-16 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {[
              { step: "01", icon: Clock, title: "Upload", desc: "Import historical patient, weather, and calendar data" },
              { step: "02", icon: LineChart, title: "Explore", desc: "Visualize patterns, seasonality, and correlations" },
              { step: "03", icon: Brain, title: "Train", desc: "Build and compare forecasting models automatically" },
              { step: "04", icon: Calendar, title: "Forecast", desc: "Generate 7-day predictions with confidence intervals" },
              { step: "05", icon: Zap, title: "Optimize", desc: "Create optimal staff schedules and supply orders" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative flex flex-col items-center py-4 text-center">
                  {i < 4 && <div className="absolute right-0 top-12 hidden h-px w-full bg-gradient-to-r from-transparent via-slate-600 to-transparent lg:block" />}
                  <div className="mb-2 text-[10px] font-bold tracking-widest text-cyan-400">STEP {item.step}</div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400/30 bg-cyan-400/10">
                    <Icon size={22} className="text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== Image Gallery — 4 photos with captions ========== */}
      <section className="grid grid-cols-2 sm:grid-cols-4">
        {[
          { src: "/images/staff-bg.jpg", label: "Our Team" },
          { src: "/images/carousel-2.jpg", label: "Analytics" },
          { src: "/images/supply-bg.jpg", label: "Supply Chain" },
          { src: "/images/team-bg2.jpg", label: "Collaboration" },
        ].map((img) => (
          <div key={img.src} className="group relative h-48 overflow-hidden sm:h-56">
            <Image src={img.src} alt={img.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-blue-900/35" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/60 to-transparent p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/90">{img.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ========== Benefits — clean layout with team photos ========== */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Why HealthForecast AI</div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">Built for Hospital Decision Makers</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4">Whether you are a hospital administrator, nursing director, or operations manager — HealthForecast AI gives you the insights you need to make better decisions, faster.</p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Heart, title: "Improve Patient Care", desc: "Ensure the right staff and supplies are available when patients need them most.", color: "text-red-500 bg-red-50 border-red-200" },
                  { icon: TrendingUp, title: "Reduce Operational Costs", desc: "Minimize overtime, prevent overstocking, and eliminate inefficiencies in resource allocation.", color: "text-blue-600 bg-blue-50 border-blue-200" },
                  { icon: Shield, title: "Data-Driven Confidence", desc: "Every forecast includes prediction intervals so you can plan for best and worst case scenarios.", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                ].map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} className="flex gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${b.color}`}><Icon size={18} /></div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: photos + metrics */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative h-40 overflow-hidden rounded-xl border border-slate-200 shadow-md sm:h-48">
                  <Image src="/images/team-bg1.jpg" alt="Healthcare team" fill className="object-cover" />
                </div>
                <div className="relative h-40 overflow-hidden rounded-xl border border-slate-200 shadow-md sm:h-48">
                  <Image src="/images/carousel-4.jpg" alt="Data analytics" fill className="object-cover" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Platform Performance</h3>
                {[
                  { label: "Forecast Accuracy", value: 96, color: "bg-blue-500" },
                  { label: "Staff Coverage", value: 94, color: "bg-sky-500" },
                  { label: "Supply Service Level", value: 98, color: "bg-emerald-500" },
                  { label: "Cost Efficiency", value: 87, color: "bg-red-400" },
                ].map((m) => (
                  <div key={m.label} className="mb-3 last:mb-0">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">{m.label}</span>
                      <span className="font-mono text-sm font-bold text-slate-800">{m.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA — strong dark background, readable text ========== */}
      <section className="relative overflow-hidden bg-slate-900 py-16 sm:py-24">
        <Image src="/images/actions-bg.jpg" alt="" fill className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-slate-900/90" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Ready to Transform Your Hospital Operations?</h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-300">Start forecasting patient demand, optimizing schedules, and making data-driven decisions today.</p>
          <Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-sm font-bold text-blue-700 shadow-xl transition-all hover:bg-blue-50">
            Get Started Now <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <HeartbeatLogo size={24} />
            <span className="text-xs text-slate-500">HealthForecast AI — Master Thesis Prototype</span>
          </div>
          <div className="text-xs text-slate-400">&copy; 2026</div>
        </div>
      </footer>
    </div>
  );
}
