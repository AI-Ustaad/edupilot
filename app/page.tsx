"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, ArrowRight, Zap, Users, 
  BarChart3, Clock, Menu, X, MessageCircle,
  HelpCircle, Globe, BookOpen, GraduationCap, PenTool,
  Wallet, FileText, Smartphone
} from "lucide-react";

// ==========================================
// 🌐 BILINGUAL DICTIONARY (English & Urdu)
// ==========================================
const translations = {
  en: {
    navFeatures: "Features",
    navFaqs: "FAQs",
    navLogin: "Login",
    heroBadge: "Pakistan's #1 AI School System",
    heroTitle1: "Digitalize your School",
    heroTitle2: "Without Hassle.",
    heroSub: "From live attendance to automated result cards and fee tracking, everything is just a click away. Built for modern principals.",
    btnFeatures: "Explore Features",
    btnLogin: "Sign In Now",
    featTitle: "Powerful Features",
    feat1Title: "Smart Attendance",
    feat1Desc: "Mark staff and student attendance directly from your mobile phone with real-time updates.",
    feat2Title: "Fast Results & Analytics",
    feat2Desc: "Enter marks and let the system instantly generate result cards and performance analytics.",
    feat3Title: "Timetable & Proxies",
    feat3Desc: "Easily manage teacher leaves and assign adjustment (proxy) periods to keep classes running.",
    darkBoxTitle: "Complete Control, All in One Place",
    darkBoxSub: "EduPilot provides enterprise-grade tools to manage every aspect of your educational institute.",
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
    contactTitle: "Ready to Upgrade Your School?",
    contactSub: "Contact us on WhatsApp today and transform your school management with EduPilot.",
    contactBtn: "WhatsApp Contact",
    portalBtn: "Go to Portal"
  },
  ur: {
    navFeatures: "خصوصیات",
    navFaqs: "سوالات",
    navLogin: "لاگ ان",
    heroBadge: "پاکستان کا پہلا جدید اسکول سسٹم",
    heroTitle1: "اپنے اسکول کو ڈیجیٹل بنائیں",
    heroTitle2: "نہایت آسانی کے ساتھ۔",
    heroSub: "لائیو حاضری سے لے کر آٹو رزلٹ کارڈز اور فیس ٹریکنگ تک، تمام انتظامی امور اب ایک کلک کی دوری پر۔",
    btnFeatures: "خصوصیات دیکھیں",
    btnLogin: "ابھی لاگ ان کریں",
    featTitle: "شاندار خصوصیات",
    feat1Title: "اسمارٹ حاضری",
    feat1Desc: "طلباء اور عملے کی حاضری براہ راست اپنے موبائل فون سے لگائیں اور لائیو اپڈیٹس حاصل کریں۔",
    feat2Title: "تیز ترین نتائج",
    feat2Desc: "صرف نمبر درج کریں اور سسٹم خود بخود رزلٹ کارڈز اور تفصیلی تجزیاتی رپورٹ تیار کر دے گا۔",
    feat3Title: "ٹائم ٹیبل اور پراکسی",
    feat3Desc: "اساتذہ کی چھٹیاں اور ان کی جگہ متبادل (پراکسی) پیریڈز کو انتہائی آسانی سے منظم کریں۔",
    darkBoxTitle: "مکمل کنٹرول، ایک ہی ڈیش بورڈ پر",
    darkBoxSub: "EduPilot آپ کے تعلیمی ادارے کے ہر پہلو کو بہترین انداز میں چلانے کے لیے جدید ترین ٹولز فراہم کرتا ہے۔",
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
    contactTitle: "کیا آپ اسکول کو اپگریڈ کرنے کے لیے تیار ہیں؟",
    contactSub: "ابھی واٹس ایپ پر رابطہ کریں اور EduPilot کے ساتھ اپنے اسکول کو جدید دور میں شامل کریں۔",
    contactBtn: "واٹس ایپ پر رابطہ کریں",
    portalBtn: "پورٹل پر جائیں"
  }
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "ur">("ur"); // Default language is Urdu

  const t = translations[lang];
  const isUrdu = lang === "ur";

  return (
    // 🚀 LTR / RTL Direction Support
    <div dir={isUrdu ? "rtl" : "ltr"} className={`min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-[#78d13b]/30 ${isUrdu ? 'font-sans' : 'font-sans'}`}>
      
      {/* 🚀 NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#78d13b]" size={36} />
            <span className="font-black text-2xl tracking-tight text-slate-900">EduPilot</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-[#78d13b] transition-colors">{t.navFeatures}</Link>
            <Link href="#faq" className="text-sm font-bold text-slate-500 hover:text-[#78d13b] transition-colors">{t.navFaqs}</Link>
            
            {/* Language Toggle */}
            <button 
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <Globe size={16}/> {lang === "en" ? "اردو" : "English"}
            </button>

            <Link href="/login" className="bg-[#0F172A] text-white px-8 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-slate-200">
              {t.navLogin}
            </Link>
          </div>

          {/* Mobile Toggle Area */}
          <div className="flex md:hidden items-center gap-4">
            <button 
              onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="flex items-center justify-center text-slate-600 bg-slate-100 w-10 h-10 rounded-full"
            >
              <Globe size={18}/>
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 animate-fade-in-down">
            <Link href="#features" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-600">{t.navFeatures}</Link>
            <Link href="#faq" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-600">{t.navFaqs}</Link>
            <Link href="/login" className="block w-full bg-[#0F172A] text-white text-center py-4 rounded-xl font-black">{t.navLogin}</Link>
          </div>
        )}
      </nav>

      {/* 🚀 HERO SECTION WITH SCHOOL ANIMATIONS */}
      <section className="pt-32 sm:pt-40 pb-20 px-4 relative overflow-hidden">
        
        {/* Animated Background Graphics */}
        <div className="absolute top-20 left-10 opacity-10 animate-[bounce_4s_infinite] text-[#78d13b]"><BookOpen size={80} /></div>
        <div className="absolute top-40 right-10 opacity-10 animate-[bounce_5s_infinite_reverse] text-[#ffc122]"><GraduationCap size={100} /></div>
        <div className="absolute bottom-20 left-20 opacity-10 animate-[bounce_6s_infinite] text-[#ff7b60]"><PenTool size={60} /></div>
        <div className="absolute bottom-10 right-32 opacity-5 animate-[bounce_3s_infinite_reverse] text-slate-900"><Users size={90} /></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10 mt-10">
          <div className="inline-flex items-center gap-2 bg-[#78d13b]/10 border border-[#78d13b]/20 px-4 py-2 rounded-full">
            <Zap size={16} className="text-[#ffc122] fill-[#ffc122]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#78d13b]">{t.heroBadge}</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 leading-[1.2] sm:leading-[1.1] tracking-tight">
            {t.heroTitle1} <br />
            <span className="text-[#78d13b]">{t.heroTitle2}</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            {t.heroSub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="#features" className="w-full sm:w-auto bg-[#78d13b] text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#78d13b]/30">
              {t.btnFeatures}
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              {t.btnLogin} <ArrowRight size={24} className={isUrdu ? "rotate-180" : ""} />
            </Link>
          </div>
        </div>
      </section>

      {/* 🚀 FEATURES SECTION (White Cards) */}
      <section id="features" className="py-24 bg-slate-50/50 px-4 relative z-10">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase">{t.featTitle}</h2>
          <div className="w-20 h-1.5 bg-[#ffc122] mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="w-16 h-16 bg-[#78d13b]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#78d13b] transition-colors">
              <Users className="text-[#78d13b] group-hover:text-white" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{t.feat1Title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{t.feat1Desc}</p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="w-16 h-16 bg-[#ffc122]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#ffc122] transition-colors">
              <BarChart3 className="text-[#ffc122] group-hover:text-white" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{t.feat2Title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{t.feat2Desc}</p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="w-16 h-16 bg-[#ff7b60]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#ff7b60] transition-colors">
              <Clock className="text-[#ff7b60] group-hover:text-white" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{t.feat3Title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{t.feat3Desc}</p>
          </div>
        </div>
      </section>

      {/* 🚀 DEEP FEATURES SHOWCASE (The Dark Box instead of fake demo) */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto bg-[#0F172A] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-slate-800">
          <div className="p-8 md:p-16 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white">{t.darkBoxTitle}</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">{t.darkBoxSub}</p>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
               
               {/* Detail Card 1 */}
               <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <Wallet className="text-[#78d13b] mb-4" size={32}/>
                 <h4 className="text-xl font-black text-white mb-2">{t.dbF1Title}</h4>
                 <p className="text-slate-400 text-sm">{t.dbF1Desc}</p>
               </div>

               {/* Detail Card 2 */}
               <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <FileText className="text-[#ffc122] mb-4" size={32}/>
                 <h4 className="text-xl font-black text-white mb-2">{t.dbF2Title}</h4>
                 <p className="text-slate-400 text-sm">{t.dbF2Desc}</p>
               </div>

               {/* Detail Card 3 */}
               <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <MessageCircle className="text-[#ff7b60] mb-4" size={32}/>
                 <h4 className="text-xl font-black text-white mb-2">{t.dbF3Title}</h4>
                 <p className="text-slate-400 text-sm">{t.dbF3Desc}</p>
               </div>

               {/* Detail Card 4 */}
               <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors ${isUrdu ? 'text-right' : 'text-left'}`}>
                 <Smartphone className="text-blue-400 mb-4" size={32}/>
                 <h4 className="text-xl font-black text-white mb-2">{t.dbF4Title}</h4>
                 <p className="text-slate-400 text-sm">{t.dbF4Desc}</p>
               </div>

            </div>
          </div>
        </div>
      </section>

      {/* 🚀 FAQ SECTION */}
      <section id="faq" className="py-24 bg-slate-50 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 uppercase mb-12">{t.faqTitle}</h2>
          <div className="space-y-4">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#78d13b] transition-all group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 text-lg">{t.faq1}</span>
                <HelpCircle className="text-slate-300 group-hover:text-[#78d13b] shrink-0" />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{t.faq1Ans}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#ffc122] transition-all group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 text-lg">{t.faq2}</span>
                <HelpCircle className="text-slate-300 group-hover:text-[#ffc122] shrink-0" />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{t.faq2Ans}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#ff7b60] transition-all group">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 text-lg">{t.faq3}</span>
                <HelpCircle className="text-slate-300 group-hover:text-[#ff7b60] shrink-0" />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{t.faq3Ans}</p>
            </div>

          </div>
        </div>
      </section>

      {/* 🚀 CONTACT / WHATSAPP CTA */}
      <section className="py-24 px-4 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-6xl font-black">{t.contactTitle}</h2>
          <p className="text-slate-400 text-lg">{t.contactSub}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="https://wa.me/923004134853" target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-[#25D366]/20">
              <MessageCircle size={28} /> {t.contactBtn}
            </a>
            <Link href="/login" className="w-full sm:w-auto border-2 border-white/20 hover:border-white px-10 py-5 rounded-2xl font-black text-lg transition-all">
              {t.portalBtn}
            </Link>
          </div>
          <div className="pt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#78d13b]" size={24} />
              <span className="font-bold text-slate-400">© 2026 EduPilot Enterprise</span>
            </div>
            <div className="text-slate-500 font-bold text-sm">
              Developed by Imran Haider Sandhu
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
