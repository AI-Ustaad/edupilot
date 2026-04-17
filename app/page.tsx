"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Globe, BarChart3, Users, FileText } from "lucide-react";

const translations = {
  en: {
    navHome: "Home",
    navAbout: "About",
    navBlog: "Blog",
    navPages: "Pages",
    navPricing: "Pricing",
    navLogin: "Login",
    btnNavAction: "Get started",
    heroTitle1: "Gain insights",
    heroTitle2: "with EduPilot",
    heroSub: "From live attendance to automated result cards and fee tracking, everything is just a click away. Built for modern principals.",
    btnHeroPrimary: "Get started",
    btnHeroSecondary: "View pricing",
    featBadge: "FEATURES",
    featTitle: "A robust set of features",
    featSub: "EduPilot provides enterprise-grade tools to manage every aspect of your educational institute.",
    feat1Title: "Realtime attendance",
    feat1Desc: "Mark staff and student attendance directly from your mobile phone with real-time updates.",
    feat2Title: "Fast analytics",
    feat2Desc: "Enter marks and let the system instantly generate result cards and performance analytics.",
    feat3Title: "Automated reports",
    feat3Desc: "Easily manage teacher leaves and assign adjustment (proxy) periods to keep classes running.",
    storyTitle: "A great story always starts with a great team",
    storySub: "Empowering educators with modern technology to streamline administration and focus on what truly matters: student success.",
    stat1: "15K+",
    stat1Sub: "Students managed",
    stat2: "500+",
    stat2Sub: "Schools onboarded",
  },
  ur: {
    navHome: "ہوم",
    navAbout: "ہمارے بارے میں",
    navBlog: "بلاگ",
    navPages: "صفحات",
    navPricing: "قیمتیں",
    navLogin: "لاگ ان",
    btnNavAction: "شروع کریں",
    heroTitle1: "اسکول کو ڈیجیٹل بنائیں",
    heroTitle2: "EduPilot کے ساتھ",
    heroSub: "لائیو حاضری سے لے کر آٹو رزلٹ کارڈز اور فیس ٹریکنگ تک، تمام انتظامی امور اب ایک کلک کی دوری پر۔",
    btnHeroPrimary: "ابھی شروع کریں",
    btnHeroSecondary: "خصوصیات دیکھیں",
    featBadge: "خصوصیات",
    featTitle: "شاندار خصوصیات کا مجموعہ",
    featSub: "EduPilot آپ کے تعلیمی ادارے کے ہر پہلو کو بہترین انداز میں چلانے کے لیے جدید ترین ٹولز فراہم کرتا ہے۔",
    feat1Title: "لائیو حاضری",
    feat1Desc: "طلباء اور عملے کی حاضری براہ راست اپنے موبائل فون سے لگائیں اور لائیو اپڈیٹس حاصل کریں۔",
    feat2Title: "تیز ترین تجزیات",
    feat2Desc: "صرف نمبر درج کریں اور سسٹم خود بخود رزلٹ کارڈز اور تفصیلی تجزیاتی رپورٹ تیار کر دے گا۔",
    feat3Title: "خودکار رپورٹس",
    feat3Desc: "اساتذہ کی چھٹیاں اور ان کی جگہ متبادل (پراکسی) پیریڈز کو انتہائی آسانی سے منظم کریں۔",
    storyTitle: "ایک عظیم کہانی ہمیشہ بہترین ٹیم سے شروع ہوتی ہے",
    storySub: "اساتذہ کو جدید ٹیکنالوجی سے بااختیار بنانا تاکہ انتظامی امور آسان ہوں اور اصل توجہ طلباء کی کامیابی پر رہے۔",
    stat1: "15K+",
    stat1Sub: "طلباء کا ریکارڈ",
    stat2: "500+",
    stat2Sub: "رجسٹرڈ اسکولز",
  }
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "ur">("en");

  const t = translations[lang];
  const isUrdu = lang === "ur";

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} className={`relative min-h-screen bg-white overflow-x-hidden ${isUrdu ? 'font-sans' : 'font-sans'}`}>
      
      {/* 🚀 EXACT TECHFLOW WAVE GRADIENT */}
      <style dangerouslySetInnerHTML={{__html: `
        .techflow-wave-bg {
          position: absolute;
          top: 0;
          right: 0;
          width: 75vw;
          height: 90vh;
          background: radial-gradient(circle at 20% 50%, rgba(255, 107, 158, 0.5) 0%, transparent 40%),
                      radial-gradient(circle at 60% 30%, rgba(0, 225, 255, 0.4) 0%, transparent 50%),
                      radial-gradient(circle at 40% 70%, rgba(255, 200, 0, 0.4) 0%, transparent 40%);
          filter: blur(70px);
          transform: rotate(-15deg);
          z-index: 0;
          pointer-events: none;
        }
        .techflow-shadow {
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0,0,0,0.03);
        }
        .text-super-tight {
          letter-spacing: -0.04em;
        }
      `}} />

      {/* Background Gradient Wave */}
      <div className="techflow-wave-bg"></div>

      <div className="relative z-10 w-full">
        
        {/* 🚀 NAVBAR */}
        <nav className="pt-8 pb-4 relative z-50">
          <div className="max-w-[1300px] mx-auto px-6 lg:px-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#111] rounded-[6px] flex items-center justify-center">
                 <div className="w-3 h-3 bg-white rounded-[2px] transform rotate-45"></div>
              </div>
              <span className="font-extrabold text-[18px] tracking-tight text-[#111]">EduPilot</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-[14px] font-semibold text-[#555] hover:text-[#000]">{t.navHome}</Link>
              <Link href="#" className="text-[14px] font-semibold text-[#555] hover:text-[#000]">{t.navAbout}</Link>
              <Link href="#" className="text-[14px] font-semibold text-[#555] hover:text-[#000]">{t.navBlog}</Link>
              <Link href="#" className="text-[14px] font-semibold text-[#555] hover:text-[#000]">{t.navPricing}</Link>
              <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="text-[14px] font-semibold text-[#555] hover:text-[#000] flex items-center gap-1.5 ml-4">
                <Globe size={15}/> {lang === "en" ? "اردو" : "EN"}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/login" className="text-[14px] font-semibold text-[#111] hover:text-[#555]">{t.navLogin}</Link>
              <Search size={18} className="text-[#111] cursor-pointer" />
              <Link href="/login" className="bg-[#111] text-white px-5 py-2.5 rounded-lg font-semibold text-[13px] hover:bg-black">
                {t.btnNavAction}
              </Link>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#111]">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* 🚀 HERO SECTION (Text + School Image) */}
        <section className="pt-16 md:pt-24 pb-20 px-6 lg:px-10 max-w-[1300px] mx-auto flex flex-col md:flex-row items-center gap-10">
          
          {/* Left Text */}
          <div className={`w-full md:w-[45%] flex flex-col ${isUrdu ? 'md:text-right' : 'md:text-left'} text-center md:items-start items-center z-20`}>
            <h1 className="text-[3.5rem] md:text-[4rem] lg:text-[4.8rem] font-black text-[#111] leading-[1.05] text-super-tight mb-6">
              {t.heroTitle1} <br />
              {t.heroTitle2}
            </h1>
            <p className="text-[16px] text-[#555] font-medium leading-[1.6] mb-8 max-w-[90%]">
              {t.heroSub}
            </p>
            <div className="flex flex-row items-center gap-4">
              <Link href="/login" className="bg-[#111] text-white px-6 py-3 rounded-lg font-semibold text-[14px] hover:bg-black transition-all">
                {t.btnHeroPrimary}
              </Link>
              <Link href="#features" className="bg-transparent text-[#111] border border-gray-200 px-6 py-3 rounded-lg font-semibold text-[14px] hover:border-gray-300 hover:bg-white/50 transition-all backdrop-blur-sm">
                {t.btnHeroSecondary}
              </Link>
            </div>
          </div>

          {/* Right Floating School Image (Exactly like Techflow UI block) */}
          <div className="w-full md:w-[55%] relative flex justify-center md:justify-end z-10 mt-10 md:mt-0">
             <div className="techflow-shadow rounded-2xl border-[6px] border-white overflow-hidden w-full max-w-[650px] aspect-[4/3] bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Modern Classroom" 
                  className="w-full h-full object-cover"
                />
             </div>
             
             {/* Techflow Style Floating Badge */}
             <div className={`absolute -bottom-6 ${isUrdu ? '-right-4' : '-left-4'} bg-white rounded-xl techflow-shadow px-5 py-4 flex items-center gap-3 z-20`}>
                <div className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50">
                   <BarChart3 size={20} className="text-[#111]" />
                </div>
                <div className="flex flex-col text-left">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analytics</span>
                   <span className="text-[15px] font-black text-[#111]">Real-time Sync</span>
                </div>
             </div>
          </div>
        </section>

        {/* 🚀 FEATURES GRID */}
        <section id="features" className="py-20 px-6 lg:px-10 max-w-[1000px] mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{t.featBadge}</span>
            <h2 className="text-[2rem] md:text-[2.5rem] font-black text-[#111] mb-4 text-super-tight">{t.featTitle}</h2>
            <p className="text-[#555] max-w-xl text-[15px] leading-relaxed">{t.featSub}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <BarChart3 className="text-gray-400 mb-4" size={24} strokeWidth={1.5} />
              <h3 className="text-[17px] font-bold text-[#111] mb-2">{t.feat1Title}</h3>
              <p className="text-[14px] text-[#555] leading-relaxed">{t.feat1Desc}</p>
            </div>
            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <Users className="text-gray-400 mb-4" size={24} strokeWidth={1.5} />
              <h3 className="text-[17px] font-bold text-[#111] mb-2">{t.feat2Title}</h3>
              <p className="text-[14px] text-[#555] leading-relaxed">{t.feat2Desc}</p>
            </div>
            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <FileText className="text-gray-400 mb-4" size={24} strokeWidth={1.5} />
              <h3 className="text-[17px] font-bold text-[#111] mb-2">{t.feat3Title}</h3>
              <p className="text-[14px] text-[#555] leading-relaxed">{t.feat3Desc}</p>
            </div>
          </div>
        </section>

        {/* 🚀 SPLIT LAYOUT (Techflow bottom half replica) */}
        <section className="py-24 px-6 lg:px-10 max-w-[1300px] mx-auto relative z-10 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
             
             {/* Left Content */}
             <div className={`w-full md:w-1/2 flex flex-col ${isUrdu ? 'md:text-right' : 'md:text-left'} z-20`}>
                <h2 className="text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] font-black text-[#111] leading-[1.1] text-super-tight mb-6">
                  {t.storyTitle}
                </h2>
                <p className="text-[16px] text-[#555] font-medium leading-relaxed mb-8">
                  {t.storySub}
                </p>
             </div>

             {/* Right Floating Images Matrix */}
             <div className="w-full md:w-1/2 relative h-[500px] flex justify-center items-center">
                
                {/* Image 1 (Top Left) */}
                <div className="absolute top-0 left-0 techflow-shadow rounded-2xl border-[6px] border-white overflow-hidden w-48 h-48 z-10">
                   <img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Student" />
                </div>

                {/* Floating Stat Card (Top Right) */}
                <div className="absolute top-10 right-4 bg-white rounded-xl techflow-shadow px-6 py-4 flex flex-col z-30">
                   <span className="text-[20px] font-black text-[#111]">{t.stat1}</span>
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t.stat1Sub}</span>
                </div>

                {/* Image 2 (Center Right) */}
                <div className="absolute top-32 right-10 techflow-shadow rounded-2xl border-[6px] border-white overflow-hidden w-56 h-64 z-20">
                   <img src="https://images.unsplash.com/photo-1580894732444-8ecded790047?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Teacher" />
                </div>

                {/* Floating Stat Card (Bottom Left) */}
                <div className="absolute bottom-20 left-10 bg-white rounded-xl techflow-shadow px-6 py-4 flex flex-col z-30">
                   <span className="text-[20px] font-black text-[#111]">{t.stat2}</span>
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t.stat2Sub}</span>
                </div>
             </div>

          </div>
        </section>

      </div>
    </div>
  );
}
