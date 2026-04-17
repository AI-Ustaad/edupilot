"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, Search, Menu, X, MessageCircle,
  HelpCircle, Globe, BarChart3, Users, FileText
} from "lucide-react";

const translations = {
  en: {
    navHome: "Home",
    navAbout: "About",
    navBlog: "Blog",
    navPages: "Pages",
    navPricing: "Pricing",
    navLogin: "Login",
    btnNavAction: "Get started ->",
    heroTitle1: "Gain insights",
    heroTitle2: "with EduPilot",
    heroSub: "From live attendance to automated result cards and fee tracking, everything is just a click away. Built for modern principals.",
    btnHeroPrimary: "Get started ->",
    btnHeroSecondary: "View features",
    featBadge: "FEATURES",
    featTitle: "A robust set of features",
    featSub: "EduPilot provides enterprise-grade tools to manage every aspect of your educational institute.",
    feat1Title: "Realtime attendance",
    feat1Desc: "Mark staff and student attendance directly from your mobile phone with real-time updates.",
    feat2Title: "Fast analytics",
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
    navBlog: "بلاگ",
    navPages: "صفحات",
    navPricing: "قیمتیں",
    navLogin: "لاگ ان",
    btnNavAction: "شروع کریں <-",
    heroTitle1: "اسکول کو ڈیجیٹل بنائیں",
    heroTitle2: "EduPilot کے ساتھ",
    heroSub: "لائیو حاضری سے لے کر آٹو رزلٹ کارڈز اور فیس ٹریکنگ تک، تمام انتظامی امور اب ایک کلک کی دوری پر۔",
    btnHeroPrimary: "ابھی شروع کریں <-",
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
  const [lang, setLang] = useState<"en" | "ur">("en"); 

  const t = translations[lang];
  const isUrdu = lang === "ur";

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} className="relative min-h-screen bg-white text-[#111] overflow-x-hidden font-sans selection:bg-pink-200">
      
      {/* 🚀 100% ACCURATE TECHFLOW MESH GRADIENT */}
      <style dangerouslySetInnerHTML={{__html: `
        .techflow-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-color: #ffffff;
          background-image: 
            radial-gradient(at 75% 15%, hsla(190, 100%, 65%, 0.45) 0px, transparent 35%),
            radial-gradient(at 25% 65%, hsla(330, 100%, 65%, 0.4) 0px, transparent 40%),
            radial-gradient(at 40% 55%, hsla(35, 100%, 60%, 0.4) 0px, transparent 40%),
            radial-gradient(at 90% 80%, hsla(45, 100%, 70%, 0.3) 0px, transparent 40%);
          filter: blur(40px);
          pointer-events: none;
        }
        .techflow-shadow {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 15px rgba(0,0,0,0.03);
        }
      `}} />

      {/* The Background Layer */}
      <div className="techflow-bg"></div>

      <div className="relative z-10 w-full">
        
        {/* 🚀 EXACT NAVBAR */}
        <nav className="pt-6 pb-4">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#111] rounded-[6px] flex items-center justify-center">
                 <div className="w-3 h-3 bg-white rounded-[2px] transform rotate-45"></div>
              </div>
              <span className="font-bold text-[18px] tracking-tight text-[#111]">EduPilot</span>
            </div>
            
            {/* Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-[14px] font-semibold text-[#555] hover:text-[#111] transition-colors">{t.navHome}</Link>
              <Link href="#" className="text-[14px] font-semibold text-[#555] hover:text-[#111] transition-colors">{t.navAbout}</Link>
              <Link href="#features" className="text-[14px] font-semibold text-[#555] hover:text-[#111] transition-colors">{t.navFeatures}</Link>
              <Link href="#faq" className="text-[14px] font-semibold text-[#555] hover:text-[#111] transition-colors">{t.navFaqs}</Link>
              <button onClick={() => setLang(lang === "en" ? "ur" : "en")} className="text-[14px] font-semibold text-[#555] hover:text-[#111] flex items-center gap-1">
                <Globe size={14}/> {lang === "en" ? "اردو" : "EN"}
              </button>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-5">
              <Search size={18} className="text-[#111] cursor-pointer" />
              <Link href="/login" className="bg-[#111] text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-black transition-all">
                {t.btnNavAction}
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#111]">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* 🚀 EXACT HERO SECTION */}
        <section className="pt-20 md:pt-24 pb-20 px-6 lg:px-8 max-w-[1280px] mx-auto flex flex-col md:flex-row items-center gap-10 lg:gap-16">
          
          {/* Left Text */}
          <div className={`w-full md:w-[45%] flex flex-col ${isUrdu ? 'md:text-right' : 'md:text-left'} text-center md:items-start items-center`}>
            <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] font-black text-[#111] leading-[1.05] tracking-tighter mb-6">
              {t.heroTitle1} <br />
              {t.heroTitle2}
            </h1>
            
            <p className="text-[16px] text-[#555] font-medium leading-relaxed mb-8 max-w-[90%]">
              {t.heroSub}
            </p>

            <div className="flex flex-row items-center gap-4">
              <Link href="/login" className="bg-[#111] text-white px-6 py-3 rounded-lg font-semibold text-[15px] flex items-center justify-center hover:bg-black transition-all">
                {t.btnHeroPrimary}
              </Link>
              <Link href="#features" className="bg-white/50 text-[#111] border border-gray-200 px-6 py-3 rounded-lg font-semibold text-[15px] hover:bg-white hover:border-gray-300 transition-all shadow-sm">
                {t.btnHeroSecondary}
              </Link>
            </div>
          </div>

          {/* Right Mockup (100% Clone Structure) */}
          <div className="w-full md:w-[55%] relative mt-12 md:mt-0 flex justify-center md:justify-end">
             <div className="bg-white border border-gray-100 rounded-2xl techflow-shadow w-full max-w-[650px] aspect-[4/3] flex flex-col overflow-hidden relative z-10">
                {/* Mac Header */}
                <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                </div>
                
                {/* Body */}
                <div className="flex-1 flex p-4 gap-5">
                   {/* Sidebar */}
                   <div className="w-1/4 h-full flex flex-col gap-4">
                      <div className="w-full h-3 bg-gray-100 rounded-md"></div>
                      <div className="space-y-2 mt-4">
                        <div className="w-3/4 h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-5/6 h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-2/3 h-2 bg-gray-100 rounded-full"></div>
                      </div>
                      <div className="space-y-2 mt-6">
                        <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-4/5 h-2 bg-gray-100 rounded-full"></div>
                      </div>
                   </div>
                   
                   {/* Main Dashboard Area */}
                   <div className="w-3/4 h-full flex flex-col gap-4">
                      <div className="w-1/3 h-5 bg-[#111] rounded-md"></div>
                      
                      {/* Fake Graph */}
                      <div className="w-full h-[45%] bg-white border border-gray-100 rounded-lg relative overflow-hidden flex flex-col justify-end p-0">
                         {/* Graph Lines */}
                         <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 opacity-10">
                            <div className="w-full border-b border-gray-400"></div>
                            <div className="w-full border-b border-gray-400"></div>
                            <div className="w-full border-b border-gray-400"></div>
                         </div>
                         <svg className="w-full h-full text-black" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,80 Q10,70 20,75 T40,60 T60,65 T80,30 L100,40" fill="none" stroke="currentColor" strokeWidth="1.5"></path>
                            <path d="M0,90 Q15,80 30,85 T50,70 T70,75 T90,50 L100,55" fill="none" stroke="#ccc" strokeWidth="1"></path>
                         </svg>
                      </div>

                      {/* Fake Bottom List */}
                      <div className="flex gap-4 w-full mt-2">
                         <div className="flex-1 space-y-2">
                           <div className="w-1/2 h-2 bg-gray-200 rounded-full"></div>
                           <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                           <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                         </div>
                         <div className="flex-1 space-y-2">
                           <div className="w-1/2 h-2 bg-gray-200 rounded-full"></div>
                           <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                           <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Small White Badge (Exactly like reference) */}
             <div className={`absolute -bottom-8 ${isUrdu ? '-right-4' : '-left-4'} bg-white rounded-xl techflow-shadow px-4 py-3 flex items-center gap-3 z-20`}>
                <div className="w-8 h-8 flex items-center justify-center border border-gray-100 rounded-md">
                   <BarChart3 size={16} className="text-[#111]" />
                </div>
                <div className="flex flex-col text-left">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                   <span className="text-[14px] font-black text-[#111]">Real-time</span>
                </div>
             </div>
          </div>
        </section>

        {/* 🚀 EXACT FEATURES SECTION */}
        <section id="features" className="py-24 px-6 lg:px-8 max-w-[1000px] mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-20">
            <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{t.featBadge}</span>
            <h2 className="text-[2rem] md:text-[2.5rem] font-black text-[#111] mb-4 tracking-tight">{t.featTitle}</h2>
            <p className="text-[#555] max-w-xl text-[16px] leading-relaxed">{t.featSub}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <BarChart3 className="text-[#111] mb-5" size={24} strokeWidth={2} />
              <h3 className="text-[18px] font-black text-[#111] mb-3">{t.feat1Title}</h3>
              <p className="text-[15px] text-[#555] leading-relaxed">{t.feat1Desc}</p>
            </div>

            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <Users className="text-[#111] mb-5" size={24} strokeWidth={2} />
              <h3 className="text-[18px] font-black text-[#111] mb-3">{t.feat2Title}</h3>
              <p className="text-[15px] text-[#555] leading-relaxed">{t.feat2Desc}</p>
            </div>

            <div className={`flex flex-col ${isUrdu ? 'text-right' : 'text-left'}`}>
              <FileText className="text-[#111] mb-5" size={24} strokeWidth={2} />
              <h3 className="text-[18px] font-black text-[#111] mb-3">{t.feat3Title}</h3>
              <p className="text-[15px] text-[#555] leading-relaxed">{t.feat3Desc}</p>
            </div>
          </div>
        </section>

        {/* 🚀 EXACT FAQ SECTION */}
        <section id="faq" className="py-24 px-6 lg:px-8 max-w-[800px] mx-auto relative z-10">
          <h2 className="text-[2rem] md:text-[2.5rem] font-black text-center text-[#111] tracking-tight mb-16">{t.faqTitle}</h2>
          <div className="space-y-6">
            
            <div className="flex flex-col border-b border-gray-200 pb-6 group">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[#111] text-[18px]">{t.faq1}</span>
                <HelpCircle className="text-gray-400" size={20}/>
              </div>
              <p className="text-[#555] text-[15px] leading-relaxed">{t.faq1Ans}</p>
            </div>

            <div className="flex flex-col border-b border-gray-200 pb-6 group">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[#111] text-[18px]">{t.faq2}</span>
                <HelpCircle className="text-gray-400" size={20}/>
              </div>
              <p className="text-[#555] text-[15px] leading-relaxed">{t.faq2Ans}</p>
            </div>

            <div className="flex flex-col border-b border-gray-200 pb-6 group">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[#111] text-[18px]">{t.faq3}</span>
                <HelpCircle className="text-gray-400" size={20}/>
              </div>
              <p className="text-[#555] text-[15px] leading-relaxed">{t.faq3Ans}</p>
            </div>

          </div>
        </section>

        {/* 🚀 FOOTER SECTION */}
        <section className="py-10 px-6 lg:px-8 max-w-[1280px] mx-auto relative z-10 border-t border-gray-200 mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#111] rounded flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-[1px] transform rotate-45"></div>
              </div>
              <span className="font-bold text-[#111] text-sm tracking-tight">EduPilot Enterprise</span>
            </div>
            <div className="text-[#555] font-medium text-[14px]">
              Developed by Imran Haider Sandhu
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
