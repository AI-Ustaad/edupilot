"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Typewriter } from "react-simple-typewriter";
import {
  Users, Calendar, Wallet, BarChart, Smartphone, Brain,
  ShieldCheck, BookOpen, GraduationCap, Award,
  Menu, X, CheckCircle, ArrowRight, Eye,
  Sparkles, Rocket, Heart, Star
} from "lucide-react";
import { loginWithGoogle } from "@/lib/auth/auth-client";
import BackgroundAnimation from "@/components/BackgroundAnimation";
import { detectCurrency, formatPrice } from "@/lib/currency";

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

const floating = {
  initial: { y: 0 },
  animate: { y: [0, -15, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }
};

const floatingDelay = {
  initial: { y: 0 },
  animate: { y: [0, 15, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }
};

// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Features", "Pricing", "Security"];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-200" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm">EP</span>
            </div>
            <span className="text-xl font-black text-gray-800">EduPilot</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors">{item}</a>
            ))}
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-pink-500">Log in</Link>
            <button onClick={loginWithGoogle} className="bg-gradient-to-r from-pink-400 to-orange-300 text-white px-5 py-2 rounded-xl font-bold hover:shadow-lg transition">
              Start Free
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg bg-white shadow">
              {isOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="block py-2 text-gray-600 font-medium" onClick={() => setIsOpen(false)}>{item}</a>
              ))}
              <Link href="/login" className="block py-2 text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Log in</Link>
              <button onClick={loginWithGoogle} className="bg-gradient-to-r from-pink-400 to-orange-300 text-white py-2 rounded-xl font-bold w-full">Start Free</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Hero Section
const HeroSection = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <motion.div variants={floating} initial="initial" animate="animate" className="absolute top-32 left-[10%] hidden lg:block">
        <BookOpen size={56} className="text-pink-300/40" />
      </motion.div>
      <motion.div variants={floatingDelay} initial="initial" animate="animate" className="absolute bottom-32 right-[10%] hidden lg:block">
        <GraduationCap size={64} className="text-purple-300/40" />
      </motion.div>
      <motion.div variants={floating} initial="initial" animate="animate" className="absolute top-1/2 left-[5%] hidden lg:block">
        <Award size={48} className="text-green-300/40" />
      </motion.div>
      <motion.div variants={floatingDelay} initial="initial" animate="animate" className="absolute bottom-40 left-[20%] hidden lg:block">
        <Star size={40} className="text-orange-300/40" />
      </motion.div>
      <motion.div variants={floating} initial="initial" animate="animate" className="absolute top-40 right-[15%] hidden lg:block">
        <Heart size={44} className="text-pink-300/40" />
      </motion.div>

      <motion.div style={{ opacity, scale }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-gray-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-gray-600">AI-Powered • Cloud-Based • Enterprise SaaS</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="text-gray-800">Run Your Entire</span><br />
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            <Typewriter words={["Educational Institution", "School", "College", "Academy"]} loop={0} cursor cursorStyle="|"
              typeSpeed={70} deleteSpeed={50} delaySpeed={2000} />
          </span><br />
          <span className="text-gray-800">with AI</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto">
          Manage students, staff, attendance, finance, analytics, exams, and communication — all from one intelligent cloud platform.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="bg-gradient-to-r from-pink-400 to-orange-300 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group">
            Start Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/demo" className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition flex items-center justify-center gap-2">
            <Eye size={20} /> Live Demo
          </Link>
          <a href="#features" className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition flex items-center justify-center gap-2">
            Book Live Demo
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-6">
          {["Cloud-Based", "AI-Powered", "Multi-Tenant SaaS", "Enterprise Security", "24/7 Support", "GDPR Compliant"].map(badge => (
            <div key={badge} className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle size={16} className="text-green-500" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

// Trust Stats
const TrustStats = () => {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, uptime: 0, schools: 0 });
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const targets = { students: 10000, teachers: 500, uptime: 99.9, schools: 150 };
        const duration = 2000, stepTime = 20, steps = duration / stepTime;
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
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: counts.students, label: "Students Managed", color: "text-pink-500" },
            { value: counts.teachers, label: "Teachers", color: "text-purple-500" },
            { value: counts.uptime, label: "Uptime", color: "text-green-500", suffix: "%" },
            { value: counts.schools, label: "Schools", color: "text-orange-500" },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="space-y-2">
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value.toLocaleString()}{stat.suffix || "+"}</p>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    { icon: Users, title: "Student Management", description: "Centralized student records with AI-driven insights.", color: "from-pink-400 to-orange-300" },
    { icon: Calendar, title: "Attendance Automation", description: "Smart attendance tracking with real-time analytics.", color: "from-blue-400 to-cyan-400" },
    { icon: Wallet, title: "Finance & Fees", description: "Automated billing, fee collection, expense tracking.", color: "from-green-400 to-emerald-400" },
    { icon: BarChart, title: "Exams & Results", description: "Digital assessments, auto-grading, result cards.", color: "from-purple-400 to-pink-400" },
    { icon: Smartphone, title: "Parent Portal", description: "Real-time parent communication and progress tracking.", color: "from-pink-400 to-rose-400" },
    { icon: Brain, title: "AI Analytics", description: "Predictive student insights and performance forecasting.", color: "from-indigo-400 to-blue-400" },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-gray-800">Everything You Need to Run Your School</motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">Powerful features designed to streamline every aspect of educational management.</motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              whileHover="hover" variants={cardHover} className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// AI Intelligence Section
const AIIntelligence = () => (
  <section className="py-24 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={16} className="text-purple-500" />
            <span className="text-xs font-medium text-gray-600">AI-Powered Intelligence</span>
          </div>
          <h2 className="text-4xl font-black mb-6 text-gray-800">AI-Powered Educational Intelligence</h2>
          <p className="text-gray-500 mb-8 text-lg">Our advanced AI engine analyzes student data, predicts outcomes, and helps educators make data-driven decisions.</p>
          <div className="space-y-4">
            {["Weak student prediction with early alerts", "Attendance trend analysis and forecasting", "Automated report generation", "AI-generated timetables", "Performance forecasting for exams"].map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="relative">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4"><Rocket size={24} className="text-pink-500" /><h3 className="font-bold text-gray-800">AI Analytics Dashboard</h3></div>
            <div className="space-y-4">
              {[{label:"Weak Student Prediction", val:"85%", color:"bg-pink-400"}, {label:"Attendance Forecast", val:"92%", color:"bg-blue-400"}, {label:"Performance Prediction", val:"78%", color:"bg-purple-400"}].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center"><span className="text-gray-600">{item.label}</span><span className="text-gray-800 font-bold">{item.val}</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className={`${item.color} h-2 rounded-full`} style={{ width: item.val }} /></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Pricing Section
const PricingSection = () => {
  const [currency, setCurrency] = useState('USD');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setCurrency(detectCurrency()); setMounted(true); }, []);

  const plans = [
    { name: "Starter", usdPrice: 0, target: "Small Academies", features: ["Up to 100 students", "Basic attendance", "Student profiles", "Email support"], popular: false },
    { name: "Professional", usdPrice: 49, target: "Schools", features: ["Up to 500 students", "All features", "Parent portal", "Priority support", "Analytics"], popular: true },
    { name: "Enterprise", usdPrice: 0, target: "Colleges & Chains", features: ["Unlimited students", "White-label", "SMS notifications", "Dedicated manager", "API access"], popular: false, isCustom: true },
  ];
  if (!mounted) return <section id="pricing" className="py-24"><div className="text-center text-gray-500">Loading...</div></section>;

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Choose the perfect plan for your institution.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -8 }}
              className={`relative bg-white border rounded-2xl p-8 shadow-sm ${plan.popular ? "border-pink-400 ring-2 ring-pink-200" : "border-gray-200"}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-400 to-orange-300 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>}
              <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                {plan.isCustom ? <span className="text-4xl font-black text-gray-800">Custom</span> : <span className="text-4xl font-black text-gray-800">{formatPrice(plan.usdPrice, currency)}</span>}
                {!plan.isCustom && plan.usdPrice > 0 && <span className="text-gray-500">/month</span>}
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle size={16} className="text-green-500" />{feature}</li>
                ))}
              </ul>
              <button onClick={loginWithGoogle} className="mt-8 block w-full text-center bg-gradient-to-r from-pink-400 to-orange-300 text-white py-3 rounded-xl font-bold hover:shadow-lg transition">Get Started</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA
const FinalCTA = () => (
  <section className="py-24 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl font-black mb-6">Transform Your Institution with AI</motion.h2>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <button onClick={loginWithGoogle} className="inline-flex items-center gap-2 bg-white text-pink-500 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all group">
          Start Free Today <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-white border-t border-gray-200 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center"><span className="text-white font-black text-sm">EP</span></div>
            <span className="text-lg font-black text-gray-800">EduPilot</span>
          </div>
          <p className="text-sm text-gray-500">The AI-Powered Operating System for Modern Education.</p>
        </div>
        <div><h4 className="font-bold text-gray-800 mb-4">Product</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li></ul></div>
        <div><h4 className="font-bold text-gray-800 mb-4">Resources</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#">Documentation</a></li><li><a href="#">API</a></li></ul></div>
        <div><h4 className="font-bold text-gray-800 mb-4">Legal</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-400"><p>&copy; 2025 EduPilot SaaS. All rights reserved.</p></div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
      <BackgroundAnimation />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <TrustStats />
        <FeaturesSection />
        <AIIntelligence />
        <PricingSection />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
