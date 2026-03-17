"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import HeartbeatLogo from "@/components/ui/HeartbeatLogo";
import DynamicImageCarousel from "@/components/ui/DynamicImageCarousel";
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

// All available images for dynamic cycling
const HERO_IMAGES = [
  "/images/hero-bg2.jpg",
  "/images/hero-bg1.jpg",
  "/images/hero-bg3.jpg",
  "/images/dashboard-bg.jpg",
];

const CAROUSEL_IMAGES = [
  "/images/carousel-1.jpg",
  "/images/carousel-2.jpg",
  "/images/carousel-3.jpg",
  "/images/carousel-4.jpg",
];

const TEAM_IMAGES = [
  "/images/team-bg1.jpg",
  "/images/team-bg2.jpg",
  "/images/team-bg4.jpg",
  "/images/staff-bg.jpg",
  "/images/team-bg7.jpg",
];

const GALLERY_SET_1 = [
  "/images/staff-bg.jpg",
  "/images/team-bg1.jpg",
  "/images/staff-bg2.jpg",
  "/images/team-bg3.jpg",
];

const GALLERY_SET_2 = [
  "/images/dashboard-bg.jpg",
  "/images/carousel-1.jpg",
  "/images/explore-bg.jpg",
  "/images/carousel-3.jpg",
];

const GALLERY_SET_3 = [
  "/images/supply-bg.jpg",
  "/images/team-bg5.jpg",
  "/images/supply-bg2.jpg",
  "/images/team-bg6.jpg",
];

const GALLERY_SET_4 = [
  "/images/team-bg2.jpg",
  "/images/actions-bg.jpg",
  "/images/team-bg4.jpg",
  "/images/prepare-bg.jpg",
];

const WORKFLOW_IMAGES = [
  "/images/hero-bg3.jpg",
  "/images/forecast-bg.jpg",
  "/images/hero-bg2.jpg",
  "/images/dashboard-bg2.jpg",
];

const CTA_IMAGES = [
  "/images/actions-bg.jpg",
  "/images/team-bg7.jpg",
  "/images/carousel-2.jpg",
  "/images/staff-bg3.jpg",
];

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
    <div className="relative min-h-screen overflow-hidden bg-white">

      {/* ========== HERO — Dynamic rotating background ========== */}
      <section className="relative overflow-hidden">
        <DynamicImageCarousel
          images={HERO_IMAGES}
          interval={6000}
          animation="zoom"
          className="absolute inset-0"
          overlay="bg-gradient-to-b from-blue-900/80 via-blue-900/70 to-white"
          priority
        />

        {/* Navigation */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center gap-3">
            <HeartbeatLogo size={40} />
            <div>
              <div className="text-sm font-bold text-white sm:text-base">HealthForecast</div>
              <div className="hidden text-[10px] font-medium tracking-wider text-blue-200 sm:block">AI PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-blue-100 transition-colors hover:text-white sm:px-5">Sign in</Link>
            <Link href="/login" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 sm:px-5">Get Started</Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-12 text-center sm:px-6 sm:pb-40 sm:pt-20">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm sm:mb-8">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-xs font-medium text-white">Intelligent Hospital Resource Planning</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mx-auto max-w-4xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl">
            Smarter Hospitals,{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent">Powered by AI</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-blue-100/90 sm:mt-6 sm:text-lg">
            Forecast patient demand, optimize staff schedules, and manage supplies with confidence. HealthForecast AI transforms hospital data into actionable insights that save time, reduce costs, and improve patient care.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link href="/login" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50 sm:w-auto">
              Launch Dashboard <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="w-full rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto">Learn More</a>
          </motion.div>

          <div className="mx-auto mt-12 max-w-md opacity-20">
            <svg viewBox="0 0 600 50" fill="none" className="w-full">
              <path d="M0 25h120l20-20 30 40 20-20 30 40 20-20h120l20-20 30 40 20-20h120" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ========== Dynamic Dashboard Carousel — replaces static mock ========== */}
      <section className="relative z-10 mx-auto -mt-20 max-w-5xl px-4 sm:-mt-24 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Browser chrome bar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="hidden rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-400 sm:block">
                healthforecast-ai.vercel.app/dashboard
              </div>
              <div className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-medium text-emerald-500">LIVE</span>
              </div>
            </div>
            {/* Dynamic image slideshow */}
            <DynamicImageCarousel
              images={CAROUSEL_IMAGES}
              interval={4000}
              animation="slideLeft"
              className="h-56 sm:h-72 md:h-80"
              overlay="bg-gradient-to-t from-white/20 to-transparent"
            />
          </div>
        </motion.div>
      </section>

      {/* ========== Stats Bar ========== */}
      <section className="relative z-10 mt-16 border-y border-slate-200 bg-slate-50">
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

      {/* ========== Features — subtle rotating background ========== */}
      <section id="features" className="relative z-10 overflow-hidden py-16 sm:py-24">
        <DynamicImageCarousel
          images={["/images/explore-bg.jpg", "/images/carousel-1.jpg", "/images/train-bg.jpg"]}
          interval={8000}
          animation="fade"
          className="absolute inset-0"
          overlay="bg-white/[0.94]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 sm:mb-4">Platform Capabilities</div>
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">Everything You Need to Manage Hospital Demand</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:mt-4">From data ingestion to actionable recommendations — a complete end-to-end platform for hospital resource planning.</p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: TrendingUp, title: "Demand Forecasting", description: "Predict patient arrivals up to 7 days ahead with high accuracy. Understand trends, seasonality, and patterns in emergency department visits.", color: "from-blue-600 to-sky-400", shadow: "shadow-blue-100" },
              { icon: Users, title: "Staff Optimization", description: "Generate optimal staff schedules that balance coverage, costs, and employee preferences. Minimize overtime while ensuring patient safety.", color: "from-sky-500 to-cyan-400", shadow: "shadow-sky-100" },
              { icon: BarChart3, title: "Data Exploration", description: "Visualize distributions, correlations, and temporal patterns in your data. Understand what drives demand before making decisions.", color: "from-indigo-500 to-blue-400", shadow: "shadow-indigo-100" },
              { icon: Brain, title: "AI-Powered Insights", description: "Receive intelligent recommendations tailored to your hospital's specific situation. Actionable advice prioritized by impact.", color: "from-violet-500 to-purple-400", shadow: "shadow-violet-100" },
              { icon: Shield, title: "Supply Management", description: "Optimize inventory levels, reduce waste, and prevent stockouts of critical medical supplies. Smart reorder alerts keep you prepared.", color: "from-emerald-500 to-teal-400", shadow: "shadow-emerald-100" },
              { icon: Activity, title: "Real-time Dashboard", description: "Monitor key performance indicators at a glance. Track forecasts, model performance, staff coverage, and supply levels in one place.", color: "from-amber-500 to-orange-400", shadow: "shadow-amber-100" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeUp} className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg sm:p-6">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} shadow-md ${feature.shadow}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== Workflow — Dynamic panoramic background ========== */}
      <section className="relative z-10 overflow-hidden py-16 sm:py-24">
        <DynamicImageCarousel
          images={WORKFLOW_IMAGES}
          interval={7000}
          animation="slideRight"
          className="absolute inset-0"
          overlay="bg-gradient-to-b from-blue-900/88 via-blue-800/82 to-blue-900/90"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-300 sm:mb-4">How It Works</div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">From Raw Data to Actionable Plans</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-blue-100/80 sm:mt-4">A streamlined pipeline that transforms your hospital data into optimized schedules and forecasts in minutes.</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-16 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
            {[
              { step: "01", icon: Clock, title: "Upload", desc: "Import your historical patient, weather, and calendar data" },
              { step: "02", icon: LineChart, title: "Explore", desc: "Visualize patterns, seasonality, and correlations in your data" },
              { step: "03", icon: Brain, title: "Train", desc: "Build and compare multiple forecasting models automatically" },
              { step: "04", icon: Calendar, title: "Forecast", desc: "Generate 7-day predictions with confidence intervals" },
              { step: "05", icon: Zap, title: "Optimize", desc: "Create optimal staff schedules and supply orders instantly" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative flex flex-col items-center px-2 py-4 text-center sm:px-4 sm:py-6">
                  {i < 4 && <div className="absolute right-0 top-14 hidden h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />}
                  <div className="mb-2 text-[10px] font-bold tracking-widest text-cyan-300/80 sm:mb-3">STEP {item.step}</div>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm sm:mb-4 sm:h-12 sm:w-12">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-blue-200/70 sm:text-xs">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== Dynamic Image Gallery — 4 panels, each cycling independently ========== */}
      <section className="relative z-10 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          <DynamicImageCarousel images={GALLERY_SET_1} interval={5000} animation="slideDown" className="h-48 sm:h-56" overlay="bg-blue-900/20 hover:bg-blue-900/10 transition-all duration-500" />
          <DynamicImageCarousel images={GALLERY_SET_2} interval={6000} animation="slideLeft" className="h-48 sm:h-56" overlay="bg-blue-900/20 hover:bg-blue-900/10 transition-all duration-500" />
          <DynamicImageCarousel images={GALLERY_SET_3} interval={4500} animation="slideUp" className="h-48 sm:h-56" overlay="bg-blue-900/20 hover:bg-blue-900/10 transition-all duration-500" />
          <DynamicImageCarousel images={GALLERY_SET_4} interval={5500} animation="slideRight" className="h-48 sm:h-56" overlay="bg-blue-900/20 hover:bg-blue-900/10 transition-all duration-500" />
        </div>
      </section>

      {/* ========== Benefits — with dynamic team photos ========== */}
      <section className="relative z-10 overflow-hidden py-16 sm:py-24">
        <DynamicImageCarousel
          images={["/images/prepare-bg.jpg", "/images/team-bg1.jpg", "/images/carousel-4.jpg"]}
          interval={9000}
          animation="fade"
          className="absolute inset-0"
          overlay="bg-white/[0.95]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 sm:mb-4">Why HealthForecast AI</div>
              <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl lg:text-4xl">Built for Hospital Decision Makers</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:mt-4">Whether you are a hospital administrator, nursing director, or operations manager — HealthForecast AI gives you the insights you need to make better decisions, faster.</p>
              <div className="mt-6 space-y-4 sm:mt-8">
                {[
                  { icon: Heart, title: "Improve Patient Care", desc: "Ensure the right staff and supplies are available when patients need them most.", color: "text-red-500 bg-red-50 border-red-100" },
                  { icon: TrendingUp, title: "Reduce Operational Costs", desc: "Minimize overtime, prevent overstocking, and eliminate inefficiencies in resource allocation.", color: "text-blue-600 bg-blue-50 border-blue-100" },
                  { icon: Shield, title: "Data-Driven Confidence", desc: "Every forecast comes with prediction intervals so you can plan for best and worst case scenarios.", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                ].map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex gap-4">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${benefit.color}`}><Icon size={16} /></div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">{benefit.title}</h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{benefit.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic visual card */}
            <div className="space-y-4">
              {/* Two dynamic image panels cycling independently */}
              <div className="grid grid-cols-2 gap-3">
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <DynamicImageCarousel images={TEAM_IMAGES} interval={4000} animation="slideUp" className="h-36 sm:h-44" />
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <DynamicImageCarousel images={CAROUSEL_IMAGES} interval={5000} animation="slideDown" className="h-36 sm:h-44" />
                </div>
              </div>
              {/* Progress metrics */}
              <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm sm:p-6">
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
                        <div className={`h-2 rounded-full ${metric.color} transition-all`} style={{ width: `${metric.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA — Dynamic panoramic background ========== */}
      <section className="relative z-10 overflow-hidden py-16 sm:py-24">
        <DynamicImageCarousel
          images={CTA_IMAGES}
          interval={5000}
          animation="slideLeft"
          className="absolute inset-0"
          overlay="bg-gradient-to-r from-blue-900/92 via-blue-800/88 to-sky-900/92"
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Ready to Transform Your Hospital Operations?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-blue-100/80 sm:mt-4">Start forecasting patient demand, optimizing schedules, and making data-driven decisions today.</p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50 sm:mt-8 sm:px-10 sm:py-4">
            Get Started Now <ChevronRight size={16} />
          </Link>
          <div className="mx-auto mt-8 max-w-sm opacity-20">
            <svg viewBox="0 0 400 40" fill="none" className="w-full">
              <path d="M0 20h80l15-16 20 32 15-16 20 32 15-16h80l15-16 20 32 15-16h80" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-6 sm:py-8">
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
