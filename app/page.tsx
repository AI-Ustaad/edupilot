"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, ArrowRight, Users, 
  BarChart3, Clock, Menu, X, MessageCircle,
  HelpCircle, Globe, Wallet, FileText, Smartphone
} from "lucide-react";

// ==========================================
// 🌐 BILINGUAL DICTIONARY (English & Urdu)
// ==========================================
const translations = {
  en: {
    navFeatures: "Features",
    navFaqs: "FAQs",
    navLogin: "Login",
    heroBadge: "Features",
    heroTitle1: "Digitalize your school",
    heroTitle2: "with EduPilot",
    heroSub: "From live attendance to automated result cards and fee tracking, everything is just a click away. Built for modern principals.",
    btnFeatures: "View features",
    btnLogin: "Get started",
    featTitle: "A robust set of features",
    featSub: "EduPilot provides enterprise-grade tools to manage every aspect of your educational institute.",
    feat1Title: "Realtime attendance",
    feat1Desc: "Mark staff and student attendance directly from your mobile phone with real-time updates.",
    feat2Title: "Fast analytics",
    feat2Desc: "Enter marks and let the system instantly generate result cards and performance analytics.",
    feat3Title: "Automated reports",
    feat3Desc: "Easily manage teacher leaves and assign adjustment (proxy) periods to keep classes running.",
    dbF1Title: "Fee Management",
    dbF1Desc: "Track collections, view pending dues, and manage defaulters seamlessly.",
    dbF2Title: "Staff Directory",
    dbF2Desc: "Maintain complete HR profiles, allowances, deductions, and calculate net salaries.",
    dbF3Title: "Parent SMS Alerts",
    dbF3Desc: "Send automated updates for attendance, results, and fee reminders directly to parents.",
    dbF4Title: "100% Mobile Ready",
    dbF4Desc: "Access your command center from anywhere, fully optimized for mobile browsers.",
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
    navFeatures: "خصوصیات",
    navFaqs: "سوالات",
    navLogin: "لاگ ان",
    heroBadge: "خصوصیات",
    heroTitle1: "اپنے اسکول کو ڈیجیٹل بنائیں",
    heroTitle2: "EduPilot کے ساتھ",
    heroSub: "لائیو حاضری سے لے کر آٹو رزلٹ کارڈز اور فیس ٹریکنگ تک، تمام انتظامی امور اب ایک کلک کی دوری پر۔",
    btnFeatures: "مزید تفصیلات",
    btnLogin: "ابھی شروع کریں",
    featTitle: "شاندار خصوصیات کا مجموعہ",
    featSub: "EduPilot آپ کے تعلیمی ادارے کے ہر پہلو کو بہترین انداز میں چلانے کے لیے جدید ترین ٹولز فراہم کرتا ہے۔",
    feat1Title: "لائیو حاضری",
    feat1Desc: "طلباء اور عملے کی حاضری براہ راست اپنے موبائل فون سے لگائیں اور لائیو اپڈیٹس حاصل کریں۔",
    feat2Title: "فوری تجزیات",
    feat2Desc: "صرف نمبر درج کریں اور سسٹم خود بخود رزلٹ کارڈز اور تفصیلی تجزیاتی رپورٹ تیار کر دے گا۔",
    feat3Title: "خودکار رپورٹس",
    feat3Desc: "اساتذہ کی چھٹیاں اور ان کی جگہ متبادل (پراکسی) پیریڈز کو انتہائی آسانی سے منظم کریں۔",
    dbF1Title: "فیس مینجمنٹ",
    dbF1Desc: "فیس کی وصولی، بقایا جات، اور نادہندگان کا مکمل لائیو ریکارڈ ایک ہی جگہ پر دیکھیں۔",
    dbF2Title: "اسٹاف ڈائریکٹری",
    dbF2Desc: "عملے کا مکمل پروفائل، الاؤنسز، کٹوتیاں، اور تنخواہوں کا حساب کتاب خودکار طریقے سے کریں۔",
    dbF3Title: "ایس ایم ایس الرٹس",
    dbF3Desc: "والدین کو حاضری، نتائج، اور فیس کی یاد دہانی کے لیے خودکار میسجز بھیجیں۔",
    dbF4Title: "100% موبائل فرینڈلی",
    dbF4Desc: "کہیں سے بھی اپنے اسکول کا کنٹرول سنبھالیں، یہ سسٹم موبائل براؤزرز کے لیے مکمل آپٹمائزڈ ہے۔",
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
    <div dir={isUrdu ? "rtl" : "ltr"} className="relative min-h-screen bg-[#ffffff] text-[#111827] overflow-x-hidden font-sans selection:bg-blue-100">
      
      {/* 🚀 EXACT CSS ANIMATIONS FOR THE REFERENCE "RAINBOW" MESH */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatWave {
          0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
          33% { transform: translate(30px, -40px) rotate(10deg) scale(1.05); }
          66% { transform: translate(-20px, 30px) rotate(-5deg) scale(0.95); }
          100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
        }
        .mesh-blob {
          position: absolute;
          filter: blur(130px);
          opacity: 0.7;
          animation: floatWave 12s infinite alternate ease-in-out;
          z-index: 0;
          pointer-events: none;
        }
        .delay-1 { animation-delay: -3s; }
        .delay-2 { animation-delay: -6s; }
        .delay-3 { animation-delay: -9s; }
        
        /* Smooth Custom Shadows matching the image */
        .ui-shadow {
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05), 0 0 20px 0 rgba(0,0,0,0.02);
        }
      `}} />

      {/* 🚀 THE EXACT RAINBOW MESH GRADIENT (Cyan, Magenta/Pink, Peach, Yellow) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         {/* Top Right Cyan */}
         <div className="mesh-blob bg-[#42d1f5] w-[40vw] h-[40vh] rounded-full top-[-10%] right-[-10%] delay-1"></div>
         {/* Bottom/Mid Left Bright Pink/Magenta */}
         <div className="mesh-blob bg-[#ff5b94] w-[50vw] h-[50vh] rounded-full top-[30%] left-[-15%] delay-2"></div>
         {/* Mid Peach/Orange blending with Pink */}
         <div className="mesh-blob bg-[#ffb07a] w-[40vw] h-[40vh] rounded-full top-[40%] left-[10%] delay-3"></div>
         {/* Far Right Soft Yellow */}
         <div className="mesh-blob bg-[#ffdf70] w-[45vw] h-[45vh] rounded-full top-[50%] right-[-10%]"></div>
      </div>

      {/* 🚀 MAIN CONTENT WRAPPER */}
      <div className="relative z-10 w-full">
        
        {/* 🚀 NAVIGATION BAR */}
        <nav className="pt-6 pb-4">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center">
                 <ShieldCheck className="text-white" size={18} />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#111827]">EduPilot</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              <Link href="#features" className="text-sm font-semibold text-[#4b5563] hover:text-[#111827] transition-colors">{t.navFeatures}</Link>
              <Link href="#faq" className="text-sm font-semibold text-[#4b5563] hover:text-[#111827] transition-colors">{t.navFaqs}</Link>
              
              <button 
                onClick={() => setLang(lang === "en" ? "ur" : "en")}
                className="flex items-center gap-2 text-sm font-semibold text-[#4b5563] hover:text-[#111827] transition-colors"
              >
                <Globe size={16}/> {lang === "en" ? "اردو" : "English"}
              </button>

              <Link href="/login" className="bg-[#111827] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all">
                {t.navLogin}
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#111827]">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/90 backdrop-blur-lg border-b border-gray-100 p-4 space-y-4 absolute w-full left-0 z-50">
              <Link href="#features" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-[#111827] px-4">{t.navFeatures}</Link>
              <Link href="#faq" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-[#111827] px-4">{t.navFaqs}</Link>
              <button onClick={() => { setLang(lang === "en" ? "ur" : "en"); setIsMenuOpen(false); }} className="block w-full text-left py-2 font-bold text-[#111827] px-4">
                {lang === "en" ? "Switch to اردو" : "Switch to English"}
              </button>
              <Link href="/login" className="block w-full bg-[#111827] text-white text-center py-4 rounded-xl font-bold">{t.navLogin}</Link>
            </div>
          )}
        </nav>

        {/* 🚀 HERO SECTION (Left Aligned Text, Right Aligned Floating UI) */}
        <section className="pt-16 md:pt-24 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-8">
          
          {/* Left Text Content */}
          <div className={`w-full md:w-[45%] lg:w-[40%] flex flex-col justify-center z-10 ${isUrdu ? 'md:text-right' : 'md:text-left'} text-center md:items-start items-center`}>
            <h1 className="text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-extrabold text-[#111827] leading-[1.05] tracking-tight mb-6">
              {t.heroTitle1} <br className="hidden md:block" />
              {t.heroTitle2}
            </h1>
            
            <p className="text-base md:text-lg text-[#4b5563] font-medium leading-relaxed mb-8 max-w-[90%]">
              {t.heroSub}
            </p>

            <div className="flex flex-row items-center gap-4">
              <Link href="/login" className="bg-[#111827] text-white px-7 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
                {t.btnLogin} <ArrowRight size={16} className={isUrdu ? "rotate-180" : ""} />
              </Link>
              <Link href="#features" className="bg-transparent text-[#111827] border border-gray-200 px-7 py-3.5 rounded-xl font-semibold text-sm hover:border-gray-300 hover:bg-white/50 transition-all backdrop-blur-sm">
                {t.btnFeatures}
              </Link>
            </div>
          </div>

          {/* Right Floating UI Mockup (Mimicking the image) */}
          <div className="w-full md:w-[55%] lg:w-[60%] relative z-10 mt-12 md:mt-0 flex justify-center md:justify-end">
             {/* The Dashboard Mockup Window */}
             <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl ui-shadow w-full max-w-[700px] h-[400px] md:h-[450px] flex flex-col overflow-hidden relative">
                {/* Mac-style Header */}
                <div className="h-10 bg-white/50 border-b border-gray-100 flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Dashboard Inner Body Mockup */}
                <div className="flex-1 flex p-4 gap-4">
                   {/* Sidebar mock */}
                   <div className="w-1/4 h-full bg-gray-50/50 rounded-xl flex flex-col gap-3 p-3">
                      <div className="w-full h-4 bg-gray-200 rounded-full mb-4"></div>
                      <div className="w-3/4 h-3 bg-gray-200 rounded-full"></div>
                      <div className="w-2/3 h-3 bg-gray-200 rounded-full"></div>
                      <div className="w-5/6 h-3 bg-gray-200 rounded-full"></div>
                   </div>
                   {/* Main Area mock */}
                   <div className="w-3/4 h-full flex flex-col gap-4">
                      <div className="w-1/3 h-6 bg-gray-200 rounded-lg"></div>
                      {/* Graph Mock */}
                      <div className="w-full h-1/2 bg-gray-50/50 border border-gray-100 rounded-xl relative overflow-hidden flex items-end">
                         <svg className="w-full h-full text-blue-400 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,100 L0,50 Q25,20 50,60 T100,30 L100,100 Z" fill="currentColor"></path>
                         </svg>
                      </div>
                      <div className="w-full flex gap-4">
                         <div className="h-16 flex-1 bg-gray-50/50 rounded-xl"></div>
                         <div className="h-16 flex-1 bg-gray-50/50 rounded-xl"></div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Small floating badge */}
             <div className="absolute -bottom-6 -left-6 bg-white rounded-xl ui-shadow p-4 flex items-center gap-3 animate-[floatWave_6s_infinite_alternate_ease-in-out]">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                   <ShieldCheck size={20} />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-gray-500 uppercase">Secure</span>
                   <span className="text-sm font-extrabold text-gray-900">Encrypted</span>
                </div>
             </div>
          </div>

        </section>

        {/* 🚀 FEATURES GRID */}
        <section id="features" className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">{t.heroBadge}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-4">{t.featTitle}</h2>
            <p className="text-[#4b5563] max-w-2xl text-sm md:text-base">{t.featSub}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-12">
            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <div className="mb-4">
                <BarChart3 className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">{t.feat1Title}</h3>
              <p className="text-sm text-[#4b5563] leading-relaxed">{t.feat1Desc}</p>
            </div>

            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <div className="mb-4">
                <Clock className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">{t.feat2Title}</h3>
              <p className="text-sm text-[#4b5563] leading-relaxed">{t.feat2Desc}</p>
            </div>

            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <div className="mb-4">
                <FileText className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#111827] mb-2">{t.feat3Title}</h3>
              <p className="text-sm text-[#4b5563] leading-relaxed">{t.feat3Desc}</p>
            </div>
          </div>
        </section>

        {/* 🚀 DEEP FEATURES */}
        <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto relative z-10">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-10 md:p-16 ui-shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
               
               <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <Wallet className="text-[#111827] mb-4" size={28}/>
                 <h4 className="text-lg font-bold text-[#111827] mb-2">{t.dbF1Title}</h4>
                 <p className="text-sm text-[#4b5563] leading-relaxed">{t.dbF1Desc}</p>
               </div>

               <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <Users className="text-[#111827] mb-4" size={28}/>
                 <h4 className="text-lg font-bold text-[#111827] mb-2">{t.dbF2Title}</h4>
                 <p className="text-sm text-[#4b5563] leading-relaxed">{t.dbF2Desc}</p>
               </div>

               <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <MessageCircle className="text-[#111827] mb-4" size={28}/>
                 <h4 className="text-lg font-bold text-[#111827] mb-2">{t.dbF3Title}</h4>
                 <p className="text-sm text-[#4b5563] leading-relaxed">{t.dbF3Desc}</p>
               </div>

               <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <Smartphone className="text-[#111827] mb-4" size={28}/>
                 <h4 className="text-lg font-bold text-[#111827] mb-2">{t.dbF4Title}</h4>
                 <p className="text-sm text-[#4b5563] leading-relaxed">{t.dbF4Desc}</p>
               </div>

            </div>
          </div>
        </section>

        {/* 🚀 FAQ SECTION */}
        <section id="faq" className="py-20 px-6 lg:px-12 max-w-[800px] mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-[#111827] mb-12">{t.faqTitle}</h2>
          <div className="space-y-4">
            
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all ui-shadow group">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[#111827] text-lg">{t.faq1}</span>
                <HelpCircle className="text-gray-300 group-hover:text-gray-600 shrink-0" size={24}/>
              </div>
              <p className="text-[#4b5563] text-sm leading-relaxed">{t.faq1Ans}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all ui-shadow group">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[#111827] text-lg">{t.faq2}</span>
                <HelpCircle className="text-gray-300 group-hover:text-gray-600 shrink-0" size={24}/>
              </div>
              <p className="text-[#4b5563] text-sm leading-relaxed">{t.faq2Ans}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all ui-shadow group">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[#111827] text-lg">{t.faq3}</span>
                <HelpCircle className="text-gray-300 group-hover:text-gray-600 shrink-0" size={24}/>
              </div>
              <p className="text-[#4b5563] text-sm leading-relaxed">{t.faq3Ans}</p>
            </div>

          </div>
        </section>

        {/* 🚀 CONTACT CTA & FOOTER */}
        <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-10 md:p-16 ui-shadow">
             <div className={`w-full md:w-1/2 ${isUrdu ? 'md:text-right' : 'md:text-left'} text-center`}>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-4">{t.contactTitle}</h2>
                <p className="text-gray-600 text-base">{t.contactSub}</p>
             </div>
             <div className="w-full md:w-1/2 flex flex-col sm:flex-row justify-center md:justify-end gap-4">
                <a href="https://wa.me/923004134853" target="_blank" rel="noreferrer" className="bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all ui-shadow">
                  <MessageCircle size={20} /> {t.contactBtn}
                </a>
                <Link href="/login" className="bg-[#111827] text-white px-8 py-4 rounded-xl font-bold text-sm text-center hover:bg-gray-800 transition-all">
                  {t.portalBtn}
                </Link>
             </div>
          </div>
          
          {/* Minimalist Footer */}
          <div className="mt-20 pt-8 border-t border-gray-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-gray-900" size={20} />
              <span className="font-bold text-gray-900 text-sm">© 2026 EduPilot Enterprise</span>
            </div>
            <div className="text-gray-500 font-medium text-xs">
              Developed by Imran Haider Sandhu
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
