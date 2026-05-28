"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Typewriter } from "react-simple-typewriter";
import {
  Users, Calendar, Wallet, BarChart, Smartphone, Brain,
  ShieldCheck, BookOpen, GraduationCap, Award,
  Menu, X, Moon, Sun, CheckCircle, ArrowRight, Eye,
  Sparkles, Rocket, Heart, Star
} from "lucide-react";
import { loginWithGoogle } from "@/lib/auth/auth-client";
import ParticleBackground from "@/components/ParticleBackground";
import { detectCurrency, formatPrice } from "@/lib/currency";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl"; // 👈 نیا اضافہ

// ========== ANIMATION VARIANTS ==========
const fadeUp = { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const cardHover = { hover: { scale: 1.05, y: -10, transition: { duration: 0.2 } } };
const floating = { initial: { y: 0 }, animate: { y: [0, -15, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } } };
const floatingDelay = { initial: { y: 0 }, animate: { y: [0, 15, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } } };

// ========== COMPONENTS ==========
const Navbar = () => {
  const t = useTranslations("Landing.nav"); // 👈 ترجمہ لوڈ کریں
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", newDark ? "dark" : "light");
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
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-gray-900 font-black text-sm">EP</span>
            </div>
            <span className="text-xl font-black text-slate-800">EduPilot</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a key={item.path} href={`#${item.path}`} className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">{item.name}</a>
            ))}
            <LanguageSwitcher />
            <button onClick={toggleDarkMode} className="p-2 rounded-lg glass-card !rounded-xl !p-2 text-slate-600">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-primary">{t("login")}</Link>
            <button onClick={loginWithGoogle} className="btn-primary flex items-center gap-2">
              {t("startFree")}
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button onClick={toggleDarkMode} className="p-2 rounded-lg glass-card">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg glass-card">{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass-card !rounded-none">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a key={item.path} href={`#${item.path}`} className="block py-2 text-slate-600 font-medium" onClick={() => setIsOpen(false)}>{item.name}</a>
              ))}
              <Link href="/login" className="block py-2 text-slate-600 font-medium" onClick={() => setIsOpen(false)}>{t("login")}</Link>
              <button onClick={loginWithGoogle} className="btn-primary w-full text-center">{t("startFree")}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const HeroSection = () => {
  const t = useTranslations("Landing.hero"); // 👈 ترجمہ لوڈ کریں
  const locale = useLocale(); // زبان چیک کریں تاکہ ٹائپ رائٹر اردو میں چلے
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const typewriterWords = locale === 'ur' 
    ? ["تعلیمی ادارہ", "سکول", "کالج", "اکیڈمی"]
    : ["Educational Institution", "School", "College", "Academy"];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ParticleBackground />
      <motion.div style={{ opacity, scale }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass-card !rounded-full px-4 py-1.5 mb-6 !bg-white/20 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-700">{t("badge")}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
        >
          <span className="text-slate-800">{t("titleStart")}</span>
          <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <Typewriter words={typewriterWords} loop={0} cursor cursorStyle="|" typeSpeed={70} deleteSpeed={50} delaySpeed={2000} />
          </span>
          <br />
          <span className="text-slate-800">{t("titleEnd")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto"
        >
          {t("description")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup" className="btn-primary flex items-center justify-center gap-2 group">
            {t("startTrial")} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
          </Link>
          <Link href="/demo" className="glass-btn flex items-center justify-center gap-2 group">
            <Eye size={20} /> {t("liveDemo")}
          </Link>
          <a href="#features" className="glass-btn flex items-center justify-center gap-2">
            {t("bookDemo")}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ... باقی تمام components (TrustStats, FeaturesSection, AIIntelligence, PricingSection, FinalCTA, Footer) بالکل ویسے ہی کاپی کر لیں جیسے پچھلے کوڈ میں تھے ...

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f0ff] via-[#f0e6ff] to-[#ffe6f0]">
      <Navbar />
      <HeroSection />
      {/* نیچے والے حصوں کا کوڈ بعد میں ترجمہ کر لیں گے */}
    </div>
  );
}
