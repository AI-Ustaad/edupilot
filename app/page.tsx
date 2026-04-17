"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, ArrowRight, Users, 
  BarChart3, Clock, Menu, X, MessageCircle,
  HelpCircle, Globe, Wallet, FileText, Smartphone, Search
} from "lucide-react";

// ==========================================
// 🌐 BILINGUAL DICTIONARY (English & Urdu)
// ==========================================
const translations = {
  en: {
    navHome: "Home",
    navAbout: "About",
    navFeatures: "Features",
    navFaqs: "FAQs",
    navLogin: "Login",
    heroTitle1: "Digitalize your",
    heroTitle2: "school with EduPilot",
    heroSub: "From live attendance to automated result cards and fee tracking, everything is just a click away. Built for modern principals.",
    btnFeatures: "View features",
    btnLogin: "Get started",
    featBadge: "FEATURES",
    featTitle: "A robust set of features",
    featSub: "EduPilot provides enterprise-grade tools to manage every aspect of your educational institute.",
    feat1Title: "Realtime analytics",
    feat1Desc: "Mark staff and student attendance directly from your mobile phone with real-time updates.",
    feat2Title: "User journey",
    feat2Desc: "Enter marks and let the system instantly generate result cards and performance analytics.",
    feat3Title: "Automated reports",
    feat3Desc: "Easily manage teacher leaves and assign adjustment (proxy) periods to keep classes running.",
    faqTitle: "Frequently Asked Questions",
    faq1: "Does this system work smoothly on mobile phones?",
    faq1Ans: "Yes, EduPilot is designed with a 'Mobile-First' approach. Every feature works perfectly on smartphones, tablets, and laptops.",
    faq2: "Where can I manage the student fees?",
    faq2Ans: "The upcoming Fee Module will integrate directly into the dashboard, allowing you to track paid, pending, and total collections.",
    faq3: "How is the attendance recorded?",
    faq3Ans: "Teachers can log in from their phones and mark attendance within seconds. The principal dashboard updates instantly.",
    contactTitle: "A great story always starts with a great team",
    contactSub: "Contact us on WhatsApp today and transform your school management with EduPilot.",
    contactBtn: "WhatsApp Contact",
    portalBtn: "Go to Portal"
  },
  ur: {
    navHome: "ہوم",
    navAbout: "ہمارے بارے میں",
    navFeatures: "خصوصیات",
    navFaqs: "سوالات",
    navLogin: "لاگ ان",
    heroTitle1: "اپنے اسکول کو ڈیجیٹل بنائیں",
    heroTitle2: "EduPilot کے ساتھ",
    heroSub: "لائیو حاضری سے لے کر آٹو رزلٹ کارڈز اور فیس ٹریکنگ تک، تمام انتظامی امور اب ایک کلک کی دوری پر۔",
    btnFeatures: "مزید تفصیلات",
    btnLogin: "ابھی شروع کریں",
    featBadge: "خصوصیات",
    featTitle: "شاندار خصوصیات کا مجموعہ",
    featSub: "EduPilot آپ کے تعلیمی ادارے کے ہر پہلو کو بہترین انداز میں چلانے کے لیے جدید ترین ٹولز فراہم کرتا ہے۔",
    feat1Title: "لائیو تجزیات",
    feat1Desc: "طلباء اور عملے کی حاضری براہ راست اپنے موبائل فون سے لگائیں اور لائیو اپڈیٹس حاصل کریں۔",
    feat2Title: "یوزر جرنی",
    feat2Desc: "صرف نمبر درج کریں اور سسٹم خود بخود رزلٹ کارڈز اور تفصیلی تجزیاتی رپورٹ تیار کر دے گا۔",
    feat3Title: "خودکار رپورٹس",
    feat3Desc: "اساتذہ کی چھٹیاں اور ان کی جگہ متبادل (پراکسی) پیریڈز کو انتہائی آسانی سے منظم کریں۔",
    faqTitle: "عموماً پوچھے گئے سوالات",
    faq1: "کیا یہ سسٹم موبائل فون پر صحیح کام کرتا ہے؟",
    faq1Ans: "جی ہاں، EduPilot کو موبائل فرسٹ اپروچ پر بنایا گیا ہے۔ یہ اسمارٹ فونز، ٹیبلیٹ اور کمپیوٹر پر بہترین کام کرتا ہے۔",
    faq2: "فیس کا ریکارڈ کیسے اور کہاں رکھا جائے گا؟",
    faq2Ans: "فیس کا ماڈیول براہ راست آپ کے مین ڈیش بورڈ سے منسلک ہوگا، جہاں آپ روزانہ کی وصولی اور بقایا جات لائیو دیکھ سکیں گے۔",
    faq3: "طلباء کی حاضری کیسے لگائی جائے گی؟",
    faq3Ans: "اساتذہ اپنے موبائل سے لاگ ان کر کے چند سیکنڈز میں حاضری لگا سکتے ہیں، جس کی رپورٹ پرنسپل کو فوراً مل جاتی ہے۔",
    contactTitle: "ایک عظیم کہانی ہمیشہ ایک عظیم ٹیم سے شروع ہوتی ہے",
    contactSub: "ابھی واٹس ایپ پر رابطہ کریں اور EduPilot کے ساتھ اپنے اسکول کو جدید دور میں شامل کریں۔",
    contactBtn: "واٹس ایپ پر رابطہ کریں",
    portalBtn: "پورٹل پر جائیں"
  }
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "ur">("ur"); 

  const t = translations[lang];
  const isUrdu = lang === "ur";

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} className="relative min-h-screen bg-[#fafbfc] text-[#0f172a] overflow-x-hidden font-sans selection:bg-pink-100">
      
      {/* 🚀 EXACT CSS FOR SOFT AURORA MESH & SHADOWS */}
      <style dangerouslySetInnerHTML={{__html: `
        .soft-shadow { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05); }
        .mesh-bg {
          position: absolute;
          filter: blur(100px);
          opacity: 0.6;
          z-index: 0;
          pointer-events: none;
        }
      `}} />

      {/* 🚀 SOFT RAINBOW MESH BACKGROUND (Exactly matching the reference) */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#ffd6e4] mesh-bg"></div> {/* Soft Pink Left */}
      <div className="absolute top-[10%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-[#ffeed6] mesh-bg"></div> {/* Soft Peach/Yellow Center */}
      <div className="absolute top-[-15%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-[#d6f4ff] mesh-bg"></div> {/* Soft Cyan Right */}

      {/* 🚀 NAVIGATION BAR */}
      <nav className="relative z-50 pt-8 pb-4">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0f172a] rounded-full flex items-center justify-center">
               <ShieldCheck className="text-white" size={14} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#0f172a]">EduPilot</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-[13px] font-bold text-[#475569] hover:text-[#0f172a] transition-colors">{t.navHome}</Link>
            <Link href="#" className="text-[13px] font-bold text-[#475569] hover:text-[#0f172a] transition-colors">{t.navAbout}</Link>
            <Link href="#features" className="text-[13px] font-bold text-[#475569] hover:text-[#0f172a] transition-colors">{t.navFeatures}</Link>
            <Link href="#faq" className="text-[13px] font-bold text-[#475569] hover:text-[#0f172a] transition-colors">{t.navFaqs}</Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="text-[13px] font-bold text-[#475569] hover:text-[#0f172a] flex items-center gap-1">
              <Globe size={14}/> {lang === "en" ? "اردو" : "EN"}
            </button>
            <Link href="/login" className="text-[13px] font-bold text-[#0f172a] hover:text-[#475569] transition-colors">
              {t.navLogin}
            </Link>
            <Link href="/login" className="bg-[#0f172a] text-white px-5 py-2.5 rounded-full font-bold text-[13px] hover:bg-gray-800 transition-all flex items-center gap-2 shadow-md">
              {t.btnLogin} <ArrowRight size={14} className={isUrdu ? "rotate-180" : ""} />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#0f172a]">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-4 absolute w-full left-0 z-50 top-full">
            <Link href="#features" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-[#0f172a] px-4">{t.navFeatures}</Link>
            <Link href="#faq" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-[#0f172a] px-4">{t.navFaqs}</Link>
            <button onClick={() => { setLang(lang === "en" ? "ur" : "en"); setIsMenuOpen(false); }} className="block w-full text-left py-2 font-bold text-[#0f172a] px-4">
              {lang === "en" ? "Switch to اردو" : "Switch to English"}
            </button>
            <Link href="/login" className="block w-full bg-[#0f172a] text-white text-center py-3 rounded-full font-bold">{t.navLogin}</Link>
          </div>
        )}
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="pt-20 md:pt-32 pb-24 px-6 lg:px-8 max-w-[1200px] mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Text */}
        <div className={`w-full md:w-1/2 flex flex-col justify-center ${isUrdu ? 'md:text-right' : 'md:text-left'} text-center md:items-start items-center`}>
          <h1 className="text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-black text-[#0f172a] leading-[1.05] tracking-tighter mb-6">
            {t.heroTitle1} <br className="hidden md:block" />
            {t.heroTitle2}
          </h1>
          
          <p className="text-[15px] md:text-[17px] text-[#475569] font-medium leading-relaxed mb-8 max-w-[90%]">
            {t.heroSub}
          </p>

          <div className="flex flex-row items-center gap-4">
            <Link href="/login" className="bg-[#0f172a] text-white px-6 py-3 rounded-full font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20">
              {t.btnLogin} <ArrowRight size={16} className={isUrdu ? "rotate-180" : ""} />
            </Link>
            <Link href="#features" className="bg-transparent text-[#0f172a] border border-[#e2e8f0] px-6 py-3 rounded-full font-bold text-[14px] hover:border-gray-300 hover:bg-white/50 transition-all">
              {t.btnFeatures}
            </Link>
          </div>
        </div>

        {/* Right CSS Mockup (Matching the image style) */}
        <div className="w-full md:w-1/2 relative mt-10 md:mt-0">
           {/* Detailed CSS Dashboard Mockup */}
           <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[24px] soft-shadow w-full h-[400px] lg:h-[450px] flex flex-col overflow-hidden relative z-10 p-2">
              {/* Header */}
              <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                 </div>
                 <div className="w-32 h-2 bg-gray-100 rounded-full"></div>
              </div>
              
              {/* Body */}
              <div className="flex-1 flex gap-4 p-4">
                 {/* Sidebar */}
                 <div className="w-1/4 h-full flex flex-col gap-4 border-r border-gray-100 pr-4 pt-2">
                    <div className="w-full h-3 bg-gray-100 rounded-full"></div>
                    <div className="w-2/3 h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-3/4 h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-1/2 h-2 bg-gray-100 rounded-full mt-6"></div>
                    <div className="w-2/3 h-2 bg-gray-100 rounded-full"></div>
                 </div>
                 
                 {/* Main Content */}
                 <div className="w-3/4 h-full flex flex-col gap-4 pt-2">
                    <div className="flex justify-between items-center">
                       <div className="w-1/3 h-4 bg-gray-800 rounded-full"></div>
                       <div className="w-16 h-6 bg-gray-100 rounded-full"></div>
                    </div>
                    
                    {/* Graph Area */}
                    <div className="flex-1 bg-gray-50/50 rounded-xl border border-gray-100 relative overflow-hidden p-4 flex flex-col justify-end">
                       <svg className="w-full h-24 text-blue-500 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,100 L0,60 Q20,20 40,50 T80,40 L100,20 L100,100 Z" fill="currentColor"></path>
                          <path d="M0,60 Q20,20 40,50 T80,40 L100,20" fill="none" stroke="currentColor" strokeWidth="2"></path>
                       </svg>
                    </div>
                    
                    {/* Bottom list */}
                    <div className="h-20 w-full flex flex-col gap-2">
                       <div className="w-full h-3 bg-gray-100 rounded-full"></div>
                       <div className="w-full h-3 bg-gray-50 rounded-full"></div>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Floating Badge (Like the secure encrypted badge) */}
           <div className={`absolute -bottom-6 ${isUrdu ? '-right-6' : '-left-6'} bg-white rounded-2xl soft-shadow p-4 flex items-center gap-3 z-20 border border-gray-50`}>
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                 <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col text-left">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure</span>
                 <span className="text-[13px] font-extrabold text-gray-900">Encrypted</span>
              </div>
           </div>
        </div>

      </section>

      {/* 🚀 FEATURES GRID (Matching the exact minimalist style) */}
      <section id="features" className="py-24 px-6 lg:px-8 max-w-[1200px] mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{t.featBadge}</span>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-[#0f172a] mb-4 tracking-tight">{t.featTitle}</h2>
          <p className="text-[#475569] max-w-2xl text-[15px] font-medium leading-relaxed">{t.featSub}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
            <div className="mb-4">
              <BarChart3 className="text-gray-300" size={24} strokeWidth={2} />
            </div>
            <h3 className="text-[17px] font-extrabold text-[#0f172a] mb-2">{t.feat1Title}</h3>
            <p className="text-[14px] text-[#475569] font-medium leading-relaxed">{t.feat1Desc}</p>
          </div>

          <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
            <div className="mb-4">
              <Users className="text-gray-300" size={24} strokeWidth={2} />
            </div>
            <h3 className="text-[17px] font-extrabold text-[#0f172a] mb-2">{t.feat2Title}</h3>
            <p className="text-[14px] text-[#475569] font-medium leading-relaxed">{t.feat2Desc}</p>
          </div>

          <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
            <div className="mb-4">
              <FileText className="text-gray-300" size={24} strokeWidth={2} />
            </div>
            <h3 className="text-[17px] font-extrabold text-[#0f172a] mb-2">{t.feat3Title}</h3>
            <p className="text-[14px] text-[#475569] font-medium leading-relaxed">{t.feat3Desc}</p>
          </div>
        </div>
      </section>

      {/* 🚀 FAQ SECTION */}
      <section id="faq" className="py-24 px-6 lg:px-8 max-w-[800px] mx-auto relative z-10 border-t border-gray-100">
        <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-center text-[#0f172a] tracking-tight mb-12">{t.faqTitle}</h2>
        <div className="space-y-4">
          
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all soft-shadow group">
            <div className="flex justify-between items-center mb-3">
              <span className="font-extrabold text-[#0f172a] text-[16px] md:text-[18px]">{t.faq1}</span>
              <HelpCircle className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" size={22}/>
            </div>
            <p className="text-[#475569] text-[14px] font-medium leading-relaxed">{t.faq1Ans}</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all soft-shadow group">
            <div className="flex justify-between items-center mb-3">
              <span className="font-extrabold text-[#0f172a] text-[16px] md:text-[18px]">{t.faq2}</span>
              <HelpCircle className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" size={22}/>
            </div>
            <p className="text-[#475569] text-[14px] font-medium leading-relaxed">{t.faq2Ans}</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all soft-shadow group">
            <div className="flex justify-between items-center mb-3">
              <span className="font-extrabold text-[#0f172a] text-[16px] md:text-[18px]">{t.faq3}</span>
              <HelpCircle className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" size={22}/>
            </div>
            <p className="text-[#475569] text-[14px] font-medium leading-relaxed">{t.faq3Ans}</p>
          </div>

        </div>
      </section>

      {/* 🚀 FOOTER SECTION */}
      <section className="py-12 px-6 lg:px-8 max-w-[1200px] mx-auto relative z-10 border-t border-gray-200/60 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-gray-900" size={18} />
            <span className="font-extrabold text-gray-900 text-sm tracking-tight">© 2026 EduPilot Enterprise</span>
          </div>
          <div className="text-gray-500 font-semibold text-[13px]">
            Developed by Imran Haider Sandhu
          </div>
        </div>
      </section>

    </div>
  );
}
