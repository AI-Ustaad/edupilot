"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Users, ClipboardCheck, CreditCard, BookOpen, Globe, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const [lang, setLang] = useState("en");
  const router = useRouter();

  const translations = {
    en: {
      heroTitle: "Digitize Your School with",
      heroSub: "Pakistan's most advanced AI-powered school management system.",
      getStarted: "Get Started Now",
      navFeatures: "Features",
      navAbout: "About Us",
      loginBtn: "Admin Login",
      box1: "Students & Staff",
      box1Desc: "Manage complete student profiles, admissions, and teacher records in one secure database.",
      box2: "Smart Attendance",
      box2Desc: "Record daily attendance in seconds with an easy-to-use interface for all classes.",
      box3: "Fees & Budget",
      box3Desc: "Track collected fees, manage pending dues, staff salaries, and overall school budget.",
      box4: "AI Result Cards",
      box4Desc: "Automatically generate beautiful PDF report cards with AI-driven parent instructions.",
    },
    ur: {
      heroTitle: "اپنے اسکول کو ڈیجیٹائز کریں",
      heroSub: "پاکستان کا سب سے جدید AI سے لیس اسکول مینجمنٹ سسٹم۔",
      getStarted: "ابھی شروع کریں",
      navFeatures: "خصوصیات",
      navAbout: "ہمارے بارے میں",
      loginBtn: "لاگ ان",
      box1: "طلباء اور عملہ",
      box1Desc: "ایک محفوظ ڈیٹا بیس میں طلباء کے پروفائلز، داخلوں اور اساتذہ کے ریکارڈ کا انتظام کریں۔",
      box2: "سمارٹ حاضری",
      box2Desc: "تمام کلاسوں کے لیے استعمال میں آسان انٹرفیس کے ساتھ سیکنڈوں میں روزانہ کی حاضری ریکارڈ کریں۔",
      box3: "فیس اور بجٹ",
      box3Desc: "جمع شدہ فیسوں کا ٹریک رکھیں، واجب الادا فیس، عملے کی تنخواہوں اور اسکول کے بجٹ کا انتظام کریں۔",
      box4: "اے آئی رزلٹ کارڈ",
      box4Desc: "خودکار طور پر خوبصورت PDF رپورٹ کارڈز تیار کریں جن میں والدین کے لیے ہدایات بھی شامل ہوں۔",
    }
  };

  const t = translations[lang];

  return (
    <div className={`min-h-screen bg-[#F8F9FE] text-[#302B52] font-sans ${lang === "ur" ? "rtl font-urdu" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#7166F9] p-2 rounded-xl text-white shadow-lg"><GraduationCap size={28} /></div>
          <span className="text-2xl font-black tracking-tighter">EduPilot</span>
        </div>
        
        <div className="hidden md:flex gap-8 font-bold text-gray-400">
           <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="flex items-center gap-2 text-[#7166F9] hover:bg-purple-50 px-4 py-2 rounded-xl transition-all">
             <Globe size={18} /> {lang === "en" ? "اردو" : "English"}
           </button>
        </div>

        <button onClick={() => router.push("/login")} className="bg-[#302B52] text-white px-8 py-3 rounded-2xl font-black hover:bg-[#7166F9] transition-all shadow-xl shadow-purple-100">
          {t.loginBtn}
        </button>
      </nav>

      {/* HERO */}
      <section className="px-6 py-20 text-center max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1]">
          {t.heroTitle} <span className="text-[#7166F9]">EduPilot</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
          {t.heroSub}
        </p>
        <button onClick={() => router.push("/login")} className="bg-[#7166F9] text-white px-12 py-6 rounded-[32px] font-black text-xl flex items-center gap-4 mx-auto shadow-2xl shadow-purple-200 hover:scale-105 transition-all">
          {t.getStarted} <ArrowRight size={24} />
        </button>
      </section>

      {/* DETAILED FEATURES GRID */}
      <section className="px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {[
          { title: t.box1, desc: t.box1Desc, icon: <Users/>, color: "bg-purple-50" },
          { title: t.box2, desc: t.box2Desc, icon: <ClipboardCheck/>, color: "bg-green-50" },
          { title: t.box3, desc: t.box3Desc, icon: <CreditCard/>, color: "bg-yellow-50" },
          { title: t.box4, desc: t.box4Desc, icon: <BookOpen/>, color: "bg-blue-50" },
        ].map((feature, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all group">
            <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-[#302B52] group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
            <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
