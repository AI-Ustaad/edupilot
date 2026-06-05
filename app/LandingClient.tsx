"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from 'next/dynamic';
import {
  Users, Calendar, Wallet, BarChart, Smartphone, Brain,
  ShieldCheck, BookOpen, GraduationCap, Award,
  Menu, X, Moon, Sun, CheckCircle, ArrowRight, Eye,
  Sparkles, Rocket, Heart, Star
} from "lucide-react";
import { loginWithGoogle } from "@/lib/auth/auth-client";
import { detectCurrency, formatPrice } from "@/lib/currency";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";

// Safely import client-only components
const Typewriter = dynamic(() => import('react-simple-typewriter').then(mod => mod.Typewriter), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const cardHover = {
  hover: { scale: 1.05, y: -10, transition: { duration: 0.2 } }
};

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
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-card !rounded-none !bg-white/40 backdrop-blur-xl" : "bg-transparent"}`}>
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
  const t = useTranslations("Landing.hero");
  const locale = useLocale();
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
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent min-h-[1.5em] block">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          {["Cloud-Based", "AI-Powered", "Multi-Tenant SaaS", "Enterprise Security", "24/7 Support", "GDPR Compliant"].map(badge => (
            <div key={badge} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle size={16} className="text-success" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const TrustStats = () => {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, uptime: 0, schools: 0 });
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const targets = { students: 10000, teachers: 500, uptime: 99.9, schools: 150 };
          const duration = 2000;
          const stepTime = 20;
          const steps = duration / stepTime;
          let step = 0;
          const interval = setInterval(() => {
            step++;
            setCounts({
              students: Math.min(targets.students, Math.floor((step / steps) * targets.students)),
              teachers: Math.min(targets.teachers, Math.floor((step / steps) * targets.teachers)),
              uptime: Math.min(targets.uptime, parseFloat(((step / steps) * targets.uptime).toFixed(1))),
              schools: Math.min(targets.schools, Math.floor((step / steps) * targets.schools)),
            });
            if (step >= steps) clearInterval(interval);
          }, stepTime);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 glass-card !rounded-none !bg-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: counts.students, label: "Students Managed", color: "text-primary" },
            { value: counts.teachers, label: "Teachers", color: "text-accent" },
            { value: counts.uptime, label: "Uptime", color: "text-success", suffix: "%" },
            { value: counts.schools, label: "Schools", color: "text-primary-light" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-2"
            >
              <p className={`text-4xl font-black ${stat.color}`}>
                {stat.value.toLocaleString()}{stat.suffix || "+"}
              </p>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const t = useTranslations("Landing.features");
  const features = [
    { icon: Users, title: t("studentManagement"), description: t("studentManagementDesc"), color: "from-primary to-primary-light" },
    { icon: Calendar, title: t("attendanceAutomation"), description: t("attendanceAutomationDesc"), color: "from-secondary to-info" },
    { icon: Wallet, title: t("financeFees"), description: t("financeFeesDesc"), color: "from-success to-green-300" },
    { icon: BarChart, title: t("examsResults"), description: t("examsResultsDesc"), color: "from-accent to-accent-light" },
    { icon: Smartphone, title: t("parentPortal"), description: t("parentPortalDesc"), color: "from-primary to-pink-300" },
    { icon: Brain, title: t("aiAnalytics"), description: t("aiAnalyticsDesc"), color: "from-secondary to-blue-300" },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-slate-800">
            {t("heading")}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            {t("subheading")}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover="hover"
              variants={cardHover}
              className="group glass-card p-8"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} className="text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AIIntelligence = () => {
  const t = useTranslations("Landing.ai");
  return (
    <section className="py-24 bg-gradient-to-br from-primary/20 via-accent/20 to-info/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 glass-card !rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={16} className="text-accent" />
              <span className="text-xs font-medium text-slate-700">{t("badge")}</span>
            </div>
            <h2 className="text-4xl font-black mb-6 text-slate-800">{t("heading")}</h2>
            <p className="text-slate-600 mb-8 text-lg">{t("description")}</p>
            <div className="space-y-4">
              {[t("weakStudent"), t("attendanceTrend"), t("reportGeneration"), t("aiTimetable"), t("performance")].map((feature, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-success" />
                  <span className="text-slate-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <Rocket size={24} className="text-primary" />
                <h3 className="font-bold text-slate-800">{t("dashboardTitle")}</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-slate-600">{t("predictionLabel")}</span><span className="text-primary font-bold">{t("predictionAccuracy")}</span></div>
                <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-primary h-2 rounded-full w-[85%]" /></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">{t("forecastLabel")}</span><span className="text-secondary font-bold">{t("forecastConfidence")}</span></div>
                <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-secondary h-2 rounded-full w-[92%]" /></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">{t("performanceLabel")}</span><span className="text-accent font-bold">{t("performanceAccuracy")}</span></div>
                <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full w-[78%]" /></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const t = useTranslations("Landing.pricing");
  const [currency, setCurrency] = useState('USD');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrency(detectCurrency());
    setMounted(true);
  }, []);

  const plans = [
    { name: t("starter"), usdPrice: 0, target: t("starterTarget"), features: ["Up to 100 students", "Basic attendance", "Student profiles", "Email support"], popular: false },
    { name: t("professional"), usdPrice: 2000, target: t("professionalTarget"), features: ["Up to 500 students", "All features", "Parent portal", "Priority support", "Analytics"], popular: true },
    { name: t("enterprise"), usdPrice: 5000, target: t("enterpriseTarget"), features: ["Unlimited students", "White-label", "SMS notifications", "Dedicated manager", "API access"], popular: false },
  ];

  if (!mounted) return <section id="pricing" className="py-24"><div className="text-center text-gray-500">Loading...</div></section>;

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800">{t("heading")}</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">{t("subheading")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8 }}
              className={`relative bg-white border rounded-2xl p-8 shadow-sm ${plan.popular ? "border-pink-400 ring-2 ring-pink-200" : "border-gray-200"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-400 to-orange-300 text-white text-xs font-bold px-3 py-1 rounded-full">{t("mostPopular")}</div>}
              <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-800">
                  {plan.usdPrice === 0 ? t("free") : `Rs ${plan.usdPrice.toLocaleString()}`}
                </span>
                {plan.usdPrice > 0 && <span className="text-gray-500">{t("monthly")}</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.target}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle size={16} className="text-green-500" />{feature}</li>
                ))}
              </ul>
              <button onClick={loginWithGoogle} className="mt-8 block w-full text-center bg-gradient-to-r from-pink-400 to-orange-300 text-white py-3 rounded-xl font-bold hover:shadow-lg transition">{t("getStarted")}</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  const t = useTranslations("Landing.cta");
  return (
    <section className="py-24 bg-gradient-to-r from-primary via-accent to-info text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl font-black mb-6">{t("heading")}</motion.h2>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <button onClick={loginWithGoogle} className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all group">
            {t("button")} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  const t = useTranslations("Landing.footer");
  return (
    <footer className="glass-card !rounded-none !bg-white/5 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-black text-sm">EP</span>
              </div>
              <span className="text-lg font-black text-slate-800">EduPilot</span>
            </div>
            <p className="text-sm text-slate-500">{t("tagline")}</p>
          </div>
          <div><h4 className="font-bold text-slate-800 mb-4">{t("product")}</h4><ul className="space-y-2 text-sm text-slate-500"><li><a href="#features">{t("features")}</a></li><li><a href="#pricing">{t("pricing")}</a></li><li><a href="#">{t("security")}</a></li></ul></div>
          <div><h4 className="font-bold text-slate-800 mb-4">{t("resources")}</h4><ul className="space-y-2 text-sm text-slate-500"><li><a href="#">{t("documentation")}</a></li><li><a href="#">{t("api")}</a></li><li><a href="#">{t("support")}</a></li></ul></div>
          <div><h4 className="font-bold text-slate-800 mb-4">{t("legal")}</h4><ul className="space-y-2 text-sm text-slate-500"><li><a href="#">{t("privacy")}</a></li><li><a href="#">{t("terms")}</a></li><li><a href="#">{t("gdpr")}</a></li></ul></div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default function LandingClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return nothing on the server
  }

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
