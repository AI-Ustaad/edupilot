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
import { useTranslations, useLocale } from "next-intl";

// Safely import client-only components
const Typewriter = dynamic(() => import('react-simple-typewriter').then(mod => mod.Typewriter), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

// 🚨 THE QUARANTINE BOUNDARY (Isolates the broken section)
class SectionBoundary extends React.Component<{name: string, children: React.ReactNode}, any> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-900/90 border-2 border-red-500 rounded-lg text-white font-mono text-sm shadow-xl relative z-50">
          <strong className="text-xl text-red-300">⚠️ Crash Detected in: {this.props.name}</strong>
          <p className="mt-2 text-red-100">{String(this.state.error)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    { name: String(t("features")), path: "features" },
    { name: String(t("pricing")), path: "pricing" },
    { name: String(t("security")), path: "security" }
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
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-primary">{String(t("login"))}</Link>
            <button onClick={handleAuthClick} className="btn-primary flex items-center gap-2">{String(t("startFree"))}</button>
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
      <SectionBoundary name="ParticleBackground"><ParticleBackground /></SectionBoundary>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="text-slate-800">{String(t("titleStart"))}</span><br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent min-h-[1.5em] block">
             <SectionBoundary name="Typewriter"><Typewriter words={typewriterWords} loop={0} cursor cursorStyle="|" typeSpeed={70} deleteSpeed={50} delaySpeed={2000} /></SectionBoundary>
          </span><br />
          <span className="text-slate-800">{String(t("titleEnd"))}</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">{String(t("description"))}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary flex items-center justify-center gap-2 group">{String(t("startTrial"))}</Link>
          <a href="#features" className="glass-btn flex items-center justify-center gap-2">{String(t("bookDemo"))}</a>
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
    { icon: Users, title: String(t("studentManagement")), desc: String(t("studentManagementDesc")), color: "from-primary to-primary-light" },
    { icon: Calendar, title: String(t("attendanceAutomation")), desc: String(t("attendanceAutomationDesc")), color: "from-secondary to-info" },
    { icon: Wallet, title: String(t("financeFees")), desc: String(t("financeFeesDesc")), color: "from-success to-green-300" }
  ];

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-black text-slate-800">{String(t("heading"))}</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

const PricingSection = () => {
  const t = useTranslations("Landing.pricing");
  const plans = [
    { name: String(t("starter")), usdPrice: 0, target: String(t("starterTarget")), features: ["Up to 100 students", "Email support"], popular: false },
    { name: String(t("professional")), usdPrice: 2000, target: String(t("professionalTarget")), features: ["Up to 500 students", "Priority support"], popular: true }
  ];

  return (
    <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-black text-slate-800">{String(t("heading"))}</h2></div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <div key={idx} className={`relative bg-white border rounded-2xl p-8 shadow-sm ${plan.popular ? "border-pink-400 ring-2 ring-pink-200" : "border-gray-200"}`}>
            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-800">{plan.usdPrice === 0 ? String(t("free")) : `Rs ${plan.usdPrice.toLocaleString()}`}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{plan.target}</p>
            <button onClick={handleAuthClick} className="mt-8 block w-full text-center bg-gradient-to-r from-pink-400 to-orange-300 text-white py-3 rounded-xl font-bold">{String(t("getStarted"))}</button>
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => {
  const t = useTranslations("Landing.footer");
  return (
    <footer className="glass-card !rounded-none !bg-white/5 border-t border-white/10 py-12 text-center text-sm text-slate-500">
      <p>{String(t("copyright"))}</p>
    </footer>
  );
};

function LandingUI() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f0ff] via-[#f0e6ff] to-[#ffe6f0]">
      <SectionBoundary name="Navbar"><Navbar /></SectionBoundary>
      <SectionBoundary name="HeroSection"><HeroSection /></SectionBoundary>
      <SectionBoundary name="TrustStats"><TrustStats /></SectionBoundary>
      <SectionBoundary name="FeaturesSection"><FeaturesSection /></SectionBoundary>
      <SectionBoundary name="PricingSection"><PricingSection /></SectionBoundary>
      <SectionBoundary name="Footer"><Footer /></SectionBoundary>
    </div>
  );
}

export default function LandingClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  
  return <LandingUI />;
}
