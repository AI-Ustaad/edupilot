"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Typewriter } from "react-simple-typewriter";
import { Users, Calendar, Wallet, BarChart, Smartphone, Brain, ShieldCheck, BookOpen, GraduationCap, Award, Menu, X, Moon, Sun, CheckCircle, ArrowRight, Eye, Sparkles, Rocket, Heart, Star } from "lucide-react";
import { loginWithGoogle } from "@/lib/auth/auth-client";
import ParticleBackground from "@/components/ParticleBackground";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";

export default function LandingPage() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // یہاں وہ تمام فیچرز اور ڈیٹا موجود ہے جو پہلے تھا
  const features = [
    { icon: Users, title: "Student Management", desc: "AI-driven student records." },
    { icon: Calendar, title: "Attendance Automation", desc: "Real-time tracking." },
    { icon: Wallet, title: "Finance & Fees", desc: "Automated billing system." },
    { icon: BarChart, title: "Exams & Results", desc: "Digital assessments." },
    { icon: Smartphone, title: "Parent Portal", desc: "Real-time communication." },
    { icon: Brain, title: "AI Analytics", desc: "Predictive student insights." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f0ff] via-[#f0e6ff] to-[#ffe6f0]">
      {/* Navbar - سب کچھ موجود ہے */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card !rounded-none backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-black">EduPilot</Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <LanguageSwitcher />
            <button onClick={loginWithGoogle} className="btn-primary">Start Free</button>
          </div>
        </div>
      </nav>

      {/* Hero Section - مکمل اینیمیشن کے ساتھ */}
      <section className="pt-32 text-center px-4">
        <ParticleBackground />
        <h1 className="text-6xl font-black mb-6">
          {t("hero.titleStart")} <br />
          <span className="text-primary"><Typewriter words={["Educational Institution", "School", "Academy"]} loop={0} cursor /></span>
        </h1>
        <p className="max-w-2xl mx-auto mb-8">{t("hero.description")}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn-primary">Start Free Trial</Link>
          <Link href="/demo" className="glass-btn">Live Demo</Link>
        </div>
      </section>

      {/* Features Grid - پرانے فیچرز واپس آ گئے */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black text-center mb-16">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-8 hover:scale-105 transition-all">
              <f.icon size={40} className="mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Intelligence Section - مکمل */}
      <section className="py-20 bg-white/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">AI-Powered Intelligence</h2>
          <p className="text-lg">Our advanced AI engine analyzes student data and predicts outcomes.</p>
        </div>
      </section>
      
      <footer className="py-10 text-center">© 2026 EduPilot SaaS. All rights reserved.</footer>
    </div>
  );
}
