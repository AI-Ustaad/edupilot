"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from 'next/dynamic';
import {
  Users, Calendar, Wallet, BarChart, Smartphone, Brain,
  ShieldCheck, BookOpen, GraduationCap, Award,
  Menu, X, Moon, Sun, CheckCircle, ArrowRight, Eye,
  Sparkles, Rocket, Heart, Star
} from "lucide-react";
import { detectCurrency, formatPrice } from "@/lib/currency";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Safely import client-only components
const Typewriter = dynamic(() => import('react-simple-typewriter').then(mod => mod.Typewriter), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

// 🚀 LIGHTWEIGHT TRANSLATION FALLBACK (Bypasses next-intl crash)
const useLocale = () => "en";
const useTranslations = (namespace: string) => {
  return (key: string) => {
    const dict: Record<string, string> = {
      features: "Features", pricing: "Pricing", security: "Security", login: "Login", startFree: "Start for Free",
      badge: "EduPilot 2.0 Release", titleStart: "The Ultimate", titleEnd: "Management System",
      description: "AI-powered school management system to streamline operations, fees, and results. Built for scale.",
      startTrial: "Start Free Trial", liveDemo: "Live Demo", bookDemo: "Book a Demo",
      heading: "Platform Features", subheading: "Everything you need to manage your institution efficiently.",
      studentManagement: "Student Management", studentManagementDesc: "Complete student lifecycle tracking.",
      attendanceAutomation: "Automated Attendance", attendanceAutomationDesc: "Smart attendance with instant notifications.",
      financeFees: "Fee Management", financeFeesDesc: "Automated billing and secure fee collection.",
      examsResults: "Exam Engine", examsResultsDesc: "Generate reports and transcripts instantly.",
      parentPortal: "Parent Portal", parentPortalDesc: "Dedicated app for parents to stay updated.",
      aiAnalytics: "AI Analytics", aiAnalyticsDesc: "Predictive insights and smart dashboards.",
      starter: "Starter", starterTarget: "Up to 100 students", professional: "Professional", professionalTarget: "Up to 500 students",
      enterprise: "Enterprise", enterpriseTarget: "Unlimited students", free: "Free", monthly: "/mo",
      mostPopular: "Most Popular", getStarted: "Get Started", button: "Launch Your School Now",
      tagline: "The modern operating system for education.", product: "Product", resources: "Resources", legal: "Legal",
      documentation: "Documentation", api: "API Reference", support: "Help Center", privacy: "Privacy Policy",
      terms: "Terms of Service", gdpr: "GDPR Compliance", copyright: "© 2026 EduPilot. All rights reserved.",
      weakStudent: "Weak Student Detection", attendanceTrend: "Attendance Trends", reportGeneration: "Automated Reports",
      aiTimetable: "AI Timetable Generation", performance: "Performance Forecasting", dashboardTitle: "AI Insights",
      predictionLabel: "Pass Probability", predictionAccuracy: "95%", forecastLabel: "Revenue Forecast",
      forecastConfidence: "High", performanceLabel: "Overall Growth", performanceAccuracy: "+12%"
    };
    return dict[key] || key;
  };
};

const handleAuthClick = async () => {
  try {
    const { loginWithGoogle } = await import("@/lib/auth/auth-client");
    await loginWithGoogle();
  } catch (err: any) {
    alert("Auth Error: " + err.message);
  }
};

const fadeUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const cardHover = { hover: { scale: 1.05, y: -10, transition: { duration: 0.2 } } };

const Navbar = () => {
  const t = useTranslations("Landing.nav");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const navItems = [
    { name: t("features"), path: "features" },
    { name: t("pricing"), path: "pricing" },
    { name: t("security"), path: "security" }
  ];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-card !rounded-none !bg-white/40 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg"><span className="text-gray-900 font-black text-sm">EP</span></div>
            <span className="text-xl font-black text-slate-800">EduPilot</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (<a key={item.path} href={`#${item.path}`} className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">{item.name}</a>))}
            <LanguageSwitcher />
            <button onClick={toggleDarkMode} className="p-2 rounded-lg glass-card !rounded-xl !p-2 text-slate-600">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-primary">{t("login")}</Link>
            <button onClick={handleAuthClick} className="btn-primary flex items-center gap-2">{t("startFree")}</button>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg glass-card">{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  const t = useTranslations("Landing.hero");
  const locale = useLocale();
  const typewriterWords = locale === 'ur' ? ["تعلیمی ادارہ", "سکول", "کالج", "اکیڈمی"] : ["Educational Institution", "School", "College", "Academy"];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ParticleBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 glass-card !rounded-full px-4 py-1.5 mb-6 !bg-white/20 backdrop-blur-md">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
          <span className="text-xs font-medium text-slate-700">{t("badge")}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="text-slate-800">{t("titleStart")}</span><br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent min-h-[1.5em] block">
             <Typewriter words={typewriterWords} loop={0} cursor cursorStyle="|" typeSpeed={70} deleteSpeed={50} delaySpeed={2000} />
          </span><br />
          <span className="text-slate-800">{t("titleEnd")}</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">{t("description")}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary flex items-center justify-center gap-2 group">{t("startTrial")} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" /></Link>
          <a href="#features" className="glass-btn flex items-center justify-center gap-2">{t("bookDemo")}</a>
        </div>
      </div>
    </section>
  );
};

const TrustStats = () => {
  return (
    <section className="py-16 glass-card !rounded-none !bg-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[ { value: "10,000+", label: "Students Managed", color: "text-primary" }, { value: "500+", label: "Teachers", color: "text-accent" }, { value: "99.9%", label: "Uptime", color: "text-success" }, { value: "150+", label: "Schools", color: "text-primary-light" } ].map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const t = useTranslations("Landing.features");
  const features = [
    { icon: Users, title: t("studentManagement"), desc: t("studentManagementDesc"), color: "from-primary to-primary-light" },
    { icon: Calendar, title: t("attendanceAutomation"), desc: t("attendanceAutomationDesc"), color: "from-secondary to-info" },
    { icon: Wallet, title: t("financeFees"), desc: t("financeFeesDesc"), color: "from-success to-green-300" },
    { icon: BarChart, title: t("examsResults"), desc: t("examsResultsDesc"), color: "from-accent to-accent-light" },
    { icon: Smartphone, title: t("parentPortal"), desc: t("parentPortalDesc"), color: "from-primary to-pink-300" },
    { icon: Brain, title: t("aiAnalytics"), desc: t("aiAnalyticsDesc"), color: "from-secondary to-blue-300" }
  ];

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-black text-slate-800">{t("heading")}</h2><p className="mt-4 text-lg text-slate-600">{t("subheading")}</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="group glass-card p-8">
            <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
              <feature.icon size={28} className="text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
            <p className="text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const AIIntelligence = () => {
  const t = useTranslations("Landing.ai");
  return (
    <section className="py-24 bg-gradient-to-br from-primary/20 via-accent/20 to-info/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black mb-6 text-slate-800">{t("heading")}</h2>
            <div className="space-y-4">
              {[t("weakStudent"), t("attendanceTrend"), t("reportGeneration")].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3"><CheckCircle size={20} className="text-success" /><span>{feature}</span></div>
              ))}
            </div>
          </div>
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-4"><Rocket size={24} className="text-primary" /><h3 className="font-bold text-slate-800">{t("dashboardTitle")}</h3></div>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-slate-600">{t("predictionLabel")}</span><span className="text-primary font-bold">{t("predictionAccuracy")}</span></div>
              <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-primary h-2 rounded-full w-[85%]" /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const t = useTranslations("Landing.pricing");
  const plans = [
    { name: t("starter"), usdPrice: 0, target: t("starterTarget"), features: ["Up to 100 students", "Email support"], popular: false },
    { name: t("professional"), usdPrice: 2000, target: t("professionalTarget"), features: ["Up to 500 students", "Priority support"], popular: true }
  ];

  return (
    <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-black text-slate-800">{t("heading")}</h2></div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <div key={idx} className={`relative bg-white border rounded-2xl p-8 shadow-sm ${plan.popular ? "border-pink-400 ring-2 ring-pink-200" : "border-gray-200"}`}>
            {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-400 to-orange-300 text-white text-xs font-bold px-3 py-1 rounded-full">{t("mostPopular")}</div>}
            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1"><span className="text-4xl font-black text-gray-800">{plan.usdPrice === 0 ? t("free") : `Rs ${plan.usdPrice.toLocaleString()}`}</span></div>
            <p className="text-sm text-gray-500 mt-2">{plan.target}</p>
            <button onClick={handleAuthClick} className="mt-8 block w-full text-center bg-gradient-to-r from-pink-400 to-orange-300 text-white py-3 rounded-xl font-bold">{t("getStarted")}</button>
          </div>
        ))}
      </div>
    </section>
  );
};

const FinalCTA = () => {
  const t = useTranslations("Landing.cta");
  return (
    <section className="py-24 bg-gradient-to-r from-primary via-accent to-info text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl font-black mb-6">{t("heading")}</h2>
        <button onClick={handleAuthClick} className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all group">
          {t("button")} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

const Footer = () => {
  const t = useTranslations("Landing.footer");
  return (
    <footer className="glass-card !rounded-none !bg-white/5 border-t border-white/10 py-12 text-center text-sm text-slate-500">
      <p>{t("copyright")}</p>
    </footer>
  );
};

export default function LandingClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f0ff] via-[#f0e6ff] to-[#ffe6f0]">
      <Navbar />
      <HeroSection />
      <TrustStats />
      <FeaturesSection />
      <AIIntelligence />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
