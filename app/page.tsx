"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  Languages, GraduationCap, Users, 
  ClipboardCheck, CreditCard, Award, ArrowRight,
  ShieldCheck, Zap, Database
} from "lucide-react";

export default function LandingPage() {
  const [language, setLanguage] = useState("EN");

  const content = {
    EN: {
      title: "EduPilot: Institutional Command",
      subtitle: "The Elite Choice for Modern School Management. A Project by Imran Haider Sandhu.",
      getStarted: "Admin Login",
      features: [
        { title: "Student Management", desc: "High-detail enrollment with B-Form masking and photo sync.", icon: <Users /> },
        { title: "Smart Attendance", desc: "Real-time daily registers for Classes 1-10 with custom sections.", icon: <ClipboardCheck /> },
        { title: "Fee Management", desc: "Professional ledger for Private Fees, NSB, and FTF records.", icon: <CreditCard /> },
        { title: "AI Result Cards", desc: "One-page smart marksheets with automated grading and AI remarks.", icon: <Award /> }
      ],
      stats: ["Real-Time Data", "Secure Cloud", "Multi-User", "Audit Ready"]
    },
    UR: {
      title: "ایڈو پائلٹ: ادارہ جاتی کمانڈ",
      subtitle: "جدید اسکول مینجمنٹ کے لیے بہترین انتخاب۔ عمران حیدر سندھو کا ایک پروجیکٹ۔",
      getStarted: "ایڈمن لاگ ان",
      features: [
        { title: "طالب علم کا انتظام", desc: "بی فارم ماسکنگ اور فوٹو سنک کے ساتھ اعلیٰ داخلہ نظام۔", icon: <Users /> },
        { title: "سمارٹ حاضری", desc: "کلاس 1 تا 10 کے لیے ریئل ٹائم روزانہ رجسٹر۔", icon: <ClipboardCheck /> },
        { title: "فیس کا انتظام", desc: "پرائیویٹ فیس، NSB، اور FTF ریکارڈز کے لیے پروفیشنل لیجر۔", icon: <CreditCard /> },
        { title: "AI رزلٹ کارڈز", desc: "خودکار گریڈنگ اور تبصروں کے ساتھ ون پیج سمارٹ مارک شیٹس۔", icon: <Award /> }
      ],
      stats: ["فوری ڈیٹا", "محفوظ کلاؤڈ", "کثیر صارفین", "آڈٹ کے لیے تیار"]
    }
  };

  const current = language === "EN" ? content.EN : content.UR;

  return (
    <div className={`min-h-screen bg-[#F8F9FE] font-sans transition-all duration-500 ${language === "UR" ? "rtl" : "ltr"}`} dir={language === "UR" ? "rtl" : "ltr"}>
      {/* ELITE NAV BAR */}
      <nav className="p-6 md:p-10 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-[#302B52] p-4 rounded-[24px] text-white shadow-2xl shadow-purple-200">
            <GraduationCap size={35} />
          </div>
          <div>
            <span className="text-2xl font-black text-[#302B52] tracking-tighter block leading-none">EDUPILOT</span>
            <span className="text-[9px] font-black text-[#7166F9] uppercase tracking-[3px]">System Official</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => setLanguage(language === "EN" ? "UR" : "EN")}
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl font-black text-xs text-[#7166F9] shadow-xl shadow-purple-100/50 border border-purple-50 hover:scale-105 transition-all"
          >
            <Languages size={18} /> {language === "EN" ? "اردو" : "English"}
          </button>
          <Link href="/login" className="hidden md:block bg-[#302B52] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl hover:bg-[#7166F9] transition-all">
            {current.getStarted}
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-8 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-8 border border-purple-50">
          <ShieldCheck size={16} className="text-green-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enterprise Grade Security Enabled</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-[#302B52] mb-8 leading-[0.9] tracking-tighter">
          {current.title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-bold max-w-3xl mx-auto mb-14 leading-relaxed">
          {current.subtitle}
        </p>

        {/* QUICK STATS BAR */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-12 mb-20">
          {current.stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[#7166F9] font-black text-xs uppercase tracking-widest">
              <Zap size={14} /> {s}
            </div>
          ))}
        </div>

        {/* FEATURE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {current.features.map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-[50px] border border-transparent hover:border-[#7166F9]/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="bg-[#F8F9FE] w-16 h-16 rounded-[24px] flex items-center justify-center text-[#7166F9] mb-8 group-hover:bg-[#302B52] group-hover:text-white transition-all duration-500">
                {React.cloneElement(f.icon as React.ReactElement, { size: 30 })}
              </div>
              <h3 className="text-xl font-black text-[#302B52] mb-4">{f.title}</h3>
              <p className="text-sm text-gray-400 font-bold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* PRIMARY ACTION */}
        <div className="flex flex-col items-center gap-6">
          <Link href="/login" className="group relative inline-flex items-center gap-6 bg-[#7166F9] text-white px-16 py-8 rounded-[35px] font-black text-3xl shadow-2xl shadow-purple-300 hover:bg-[#302B52] transition-all duration-500">
            {current.getStarted} 
            <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <p className="text-gray-300 text-[10px] font-black uppercase tracking-[5px]">Authorized Access Only</p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-8 py-12 flex justify-between items-center opacity-30 border-t border-purple-50">
        <div className="flex items-center gap-4 font-black text-[#302B52] text-xs uppercase tracking-[3px]">
          <Database size={16} /> Data Grounded in Firebase
        </div>
        <div className="font-black text-[#302B52] text-xs uppercase tracking-[3px]">
          v3.0 ELITE BUILD
        </div>
      </footer>
    </div>
  );
}
