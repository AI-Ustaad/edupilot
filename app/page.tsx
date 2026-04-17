"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Globe, CreditCard, Users, FileText, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

// ==========================================
// 🌐 EDU-PILOT ORIGINAL CONTENT (FROM PAGE 2)
// ==========================================
const content = {
  UR: {
    nav: { features: "خصوصیات", faqs: "سوالات", loginBtn: "سائن ان" },
    hero: {
      badge: "پاکستانی اسکولوں کے لیے",
      title1: "پاکستان کا پہلا AI سے",
      title2: "تقویت یافتہ اسکول مینجمنٹ سسٹم",
      desc: "EduPilot اسکول مالکان اور منتظمین کو اردو یا انگریزی میں روزمرہ کے کاموں میں مدد کرتا ہے۔ بلٹ ان AI، فیس، حاضری، رپورٹ کارڈز، اور بہت کچھ۔",
    },
    why: {
      title: "اسکول مالکان EduPilot کیوں منتخب کرتے ہیں؟",
      cards: [
        { title: "فیس وصولی آسان بنائیں", desc: "ادائیگیاں، واجبات اور فیس ریکارڈ ایک جگہ ٹریک کریں۔" },
        { title: "دفتری کام کم کریں", desc: "طلباء کے ریکارڈ، حاضری، جماعتیں اور عملے کا انتظام ایک ڈیش بورڈ سے کریں۔" },
        { title: "نتائج تیزی سے بنائیں", desc: "نمبر درج کریں، رپورٹ کارڈ تیار کریں اور تعلیمی ریکارڈ منظم رکھیں۔" },
        { title: "اردو یا انگریزی میں استعمال کریں", desc: "منتظمین اور اساتذہ آرام سے اپنی زبان میں استعمال کر سکتے ہیں۔" }
      ]
    },
    tabs: {
      title: "EduPilot عمل میں دیکھیں",
      menus: ["فیس مینجمنٹ", "حاضری", "نتائج اور رپورٹ کارڈ", "طلباء اور عملہ"],
      data: [
        { title: "ادائیگیاں اور واجبات ٹریک کریں", desc: "ادائیگیاں اور واجبات ٹریک کریں\nادائیگی کی حالت فوری دیکھیں\nصاف مالی ریکارڈ رکھیں" },
        { title: "سمارٹ حاضری کا نظام", desc: "روزانہ حاضری سیکنڈوں میں لگائیں\nغائب طلباء کی رپورٹس\nوالدین کو آٹو ایس ایم ایس" },
        { title: "AI رزلٹ کارڈ جنریٹر", desc: "خودکار گریڈنگ اور پرسنٹیج\nٹیچر کے سمارٹ تبصرے\nون پیج پرنٹ ایبل رزلٹ" },
        { title: "مکمل ایچ آر مینجمنٹ", desc: "اسٹاف کی مکمل بائیو ڈیٹا\nتنخواہوں کا ریکارڈ\nطلباء کی تفصیلی پروفائلز" }
      ]
    },
    faqs: {
      title: "سوالات؟ ہمارے پاس جوابات ہیں۔",
      questions: [
        { q: "کیا میرا عملہ تکنیکی ٹریننگ کے بغیر استعمال کر سکتا ہے؟", a: "جی ہاں۔ EduPilot اسکول ٹیموں کے لیے بنایا گیا ہے، آئی ٹی ماہرین کے لیے نہیں۔" },
        { q: "کیا EduPilot اردو سپورٹ کرتا ہے؟", a: "بالکل، ہمارا سسٹم اردو زبان کو 100% سپورٹ کرتا ہے۔" },
        { q: "کیا ہم موبائل فون پر استعمال کر سکتے ہیں؟", a: "جی ہاں، EduPilot مکمل طور پر موبائل ریسپانسیو ہے۔" },
        { q: "سیٹ اپ میں کتنا وقت لگتا ہے؟", a: "سیٹ اپ بہت آسان ہے۔ آپ چند منٹوں میں طلبہ کا ڈیٹا شامل کر کے کام شروع کر سکتے ہیں۔" },
        { q: "کیا ہم فیس، حاضری اور نتائج ایک جگہ منظم کر سکتے ہیں؟", a: "جی ہاں، یہ ایک مکمل ERP ہے جہاں آپ سب کچھ ایک ڈیش بورڈ سے کنٹرول کر سکتے ہیں۔" },
        { q: "کیا یہ پاکستانی اسکولوں کے لیے بنایا گیا ہے؟", a: "جی ہاں، یہ خاص طور پر پاکستانی اسکولوں اور مقامی نصاب کے مطابق ڈیزائن کیا گیا ہے۔" },
        { q: "کیا آپ آن بورڈنگ سپورٹ فراہم کرتے ہیں؟", a: "جی ہاں، ہماری ٹیم مکمل آن بورڈنگ اور سیٹ اپ میں آپ کی رہنمائی کرتی ہے۔" }
      ]
    },
    footer: {
      cta: "اسکول مینجمنٹ آسان بنانے کے لیے تیار ہیں؟",
      rights: "EduPilot. All rights reserved 2026 ©",
      contact: "Imran Haider Sandhu | 03004134853 (Call/WA)"
    }
  },
  EN: {
    nav: { features: "Features", faqs: "FAQs", loginBtn: "Sign In" },
    hero: { 
      badge: "For Pakistani Schools", 
      title1: "Pakistan's First AI Powered", 
      title2: "School Management System", 
      desc: "Manage everything from fees to AI generated results in Urdu & English. Built-in AI, attendance, and much more."
    },
    why: { 
      title: "Why School Owners Choose EduPilot", 
      cards: [ 
        { title: "Simplify Fee Collection", desc: "Track payments and dues all in one place." }, 
        { title: "Reduce Office Work", desc: "Manage student records, attendance, and staff from one dashboard." }, 
        { title: "Fast Results", desc: "Enter marks and generate report cards instantly." }, 
        { title: "Bilingual UI", desc: "Use comfortably in Urdu or English for your staff." } 
      ] 
    },
    tabs: { 
      title: "See EduPilot in Action", 
      menus: ["Fee Management", "Attendance", "Results & Cards", "Students & Staff"], 
      data: [ 
        { title: "Track Payments", desc: "Track payments\nSee payment status\nClean financial records" }, 
        { title: "Smart Attendance", desc: "Mark daily attendance\nAbsent reports\nAuto SMS to parents" }, 
        { title: "AI Result Cards", desc: "Auto grading & percentage\nSmart teacher remarks\nPrintable results" }, 
        { title: "HR Management", desc: "Staff biodata\nSalary records\nDetailed student profiles" } 
      ] 
    },
    faqs: { 
      title: "Questions? We have answers.", 
      questions: [ 
        { q: "No technical training needed?", a: "Yes, it is designed for ease of use for school teams, not IT experts." }, 
        { q: "Does it support Urdu?", a: "Yes, our system supports Urdu 100%." }, 
        { q: "Mobile friendly?", a: "Yes, EduPilot is fully mobile responsive." }, 
        { q: "Setup time?", a: "Takes just a few minutes. You can add data and start working immediately." }, 
        { q: "All in one place?", a: "Yes, it is a complete ERP where you control everything from one dashboard." }, 
        { q: "Made for Pakistan?", a: "Yes, specially tailored for Pakistani schools and local curriculum." }, 
        { q: "Onboarding support?", a: "Yes, our team provides full onboarding and setup support." } 
      ] 
    },
    footer: {
      cta: "Ready to simplify school management?",
      rights: "EduPilot. All rights reserved 2026 ©",
      contact: "Imran Haider Sandhu | 03004134853 (Call/WA)"
    }
  }
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<"UR" | "EN">("UR");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = lang === "UR" ? content.UR : content.EN;
  const isUrdu = lang === "UR";

  return (
    <div dir={isUrdu ? "rtl" : "ltr"} className={`relative min-h-screen bg-white overflow-x-hidden ${isUrdu ? 'font-sans' : 'font-sans'}`}>
      
      {/* 🚀 EXACT TECHFLOW WAVE GRADIENT */}
      <style dangerouslySetInnerHTML={{__html: `
        .techflow-wave-bg {
          position: absolute;
          top: 0;
          right: 0;
          width: 80vw;
          height: 90vh;
          background: radial-gradient(circle at 20% 50%, rgba(255, 107, 158, 0.45) 0%, transparent 40%),
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
              <span className="font-extrabold text-[20px] tracking-tight text-[#111]">EduPilot</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-[15px] font-bold text-[#555] hover:text-[#000]">{t.nav.features}</Link>
              <Link href="#faqs" className="text-[15px] font-bold text-[#555] hover:text-[#000]">{t.nav.faqs}</Link>
              <button onClick={() => setLang(lang === "EN" ? "UR" : "EN")} className="text-[15px] font-bold text-[#555] hover:text-[#000] flex items-center gap-1.5 ml-4 border-l border-gray-300 pl-4">
                <Globe size={16}/> {lang === "EN" ? "اردو" : "English"}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/login" className="bg-[#111] text-white px-6 py-3 rounded-lg font-bold text-[14px] hover:bg-black shadow-lg shadow-gray-900/20 transition-all">
                {t.nav.loginBtn}
              </Link>
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#111]">
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>

        {/* 🚀 HERO SECTION */}
        <section className="pt-16 md:pt-24 pb-20 px-6 lg:px-10 max-w-[1300px] mx-auto flex flex-col md:flex-row items-center gap-10">
          
          {/* Left Text */}
          <div className={`w-full md:w-[48%] flex flex-col ${isUrdu ? 'md:text-right' : 'md:text-left'} text-center md:items-start items-center z-20`}>
            <div className="inline-flex items-center gap-2 bg-white/60 border border-gray-200 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#111]">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-[3.5rem] md:text-[4.2rem] lg:text-[5rem] font-black text-[#111] leading-[1.05] text-super-tight mb-6">
              {t.hero.title1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">{t.hero.title2}</span>
            </h1>
            
            <p className="text-[16px] md:text-[18px] text-[#555] font-medium leading-[1.6] mb-8 max-w-[90%]">
              {t.hero.desc}
            </p>
            
            <div className="flex flex-row items-center gap-4">
              <Link href="/login" className="bg-[#111] text-white px-8 py-4 rounded-xl font-bold text-[15px] hover:bg-black transition-all shadow-xl shadow-gray-900/20">
                {t.nav.loginBtn}
              </Link>
            </div>
          </div>

          {/* Right Floating School Image */}
          <div className="w-full md:w-[52%] relative flex justify-center md:justify-end z-10 mt-10 md:mt-0">
             <div className="techflow-shadow rounded-2xl border-[6px] border-white overflow-hidden w-full max-w-[650px] aspect-[4/3] bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Modern Classroom" 
                  className="w-full h-full object-cover"
                />
             </div>
             
             {/* Floating Badge */}
             <div className={`absolute -bottom-6 ${isUrdu ? '-right-4' : '-left-4'} bg-white rounded-xl techflow-shadow px-6 py-5 flex items-center gap-4 z-20`}>
                <div className="w-12 h-12 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50">
                   <ShieldCheck size={24} className="text-[#111]" />
                </div>
                <div className="flex flex-col text-left">
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">AI Powered</span>
                   <span className="text-[16px] font-black text-[#111]">100% Secure</span>
                </div>
             </div>
          </div>
        </section>

        {/* 🚀 FEATURES GRID (Why Choose EduPilot) */}
        <section id="features" className="py-24 px-6 lg:px-10 max-w-[1200px] mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[12px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">{t.nav.features}</span>
            <h2 className="text-[2.2rem] md:text-[3rem] font-black text-[#111] mb-4 text-super-tight leading-[1.2]">{t.why.title}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.why.cards.map((card, i) => (
              <div key={i} className={`flex flex-col bg-white p-8 rounded-2xl border border-gray-100 techflow-shadow hover:-translate-y-1 transition-transform ${isUrdu ? 'text-right' : 'text-left'}`}>
                <div className="mb-6 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                  {i === 0 ? <CreditCard className="text-[#111]" size={24}/> : i === 1 ? <Users className="text-[#111]" size={24}/> : i === 2 ? <FileText className="text-[#111]" size={24}/> : <Globe className="text-[#111]" size={24}/>}
                </div>
                <h3 className="text-[18px] font-black text-[#111] mb-3">{card.title}</h3>
                <p className="text-[14px] text-[#555] leading-relaxed font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🚀 SEE EDUPILOT IN ACTION (Split Layout matching Techflow) */}
        <section className="py-24 px-6 lg:px-10 max-w-[1300px] mx-auto relative z-10 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
             
             {/* Left Content (Tabs Data mapped to list) */}
             <div className={`w-full md:w-1/2 flex flex-col ${isUrdu ? 'md:text-right' : 'md:text-left'} z-20`}>
                <h2 className="text-[2.5rem] md:text-[3.5rem] font-black text-[#111] leading-[1.1] text-super-tight mb-10">
                  {t.tabs.title}
                </h2>
                
                <div className="space-y-8">
                  {t.tabs.data.map((tab, idx) => (
                     <div key={idx} className="flex flex-col gap-2">
                        <h4 className="text-[20px] font-black text-[#111] flex items-center gap-2">
                           <CheckCircle2 className="text-[#EAB308]" size={20}/> {tab.title}
                        </h4>
                        <div className="pl-7 opacity-80 space-y-1">
                           {tab.desc.split('\n').map((line, lIdx) => (
                              <p key={lIdx} className="text-[15px] font-medium text-[#555]">• {line}</p>
                           ))}
                        </div>
                     </div>
                  ))}
                </div>
             </div>

             {/* Right Floating Images Matrix */}
             <div className="w-full md:w-1/2 relative h-[600px] flex justify-center items-center mt-10 md:mt-0">
                
                {/* Image 1 (Top Left) */}
                <div className="absolute top-0 left-0 lg:left-10 techflow-shadow rounded-2xl border-[6px] border-white overflow-hidden w-52 h-52 z-10 bg-gray-100">
                   <img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Student" />
                </div>

                {/* Image 2 (Center Right) */}
                <div className="absolute top-40 right-0 lg:right-10 techflow-shadow rounded-2xl border-[6px] border-white overflow-hidden w-64 h-72 z-20 bg-gray-100">
                   <img src="https://images.unsplash.com/photo-1580894732444-8ecded790047?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Teacher" />
                </div>

                {/* Image 3 (Bottom Left) */}
                <div className="absolute bottom-0 left-10 techflow-shadow rounded-2xl border-[6px] border-white overflow-hidden w-56 h-40 z-30 bg-gray-100">
                   <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Classroom" />
                </div>

                {/* Floating Stat Card (Center) */}
                <div className="absolute top-24 right-20 lg:right-40 bg-white rounded-xl techflow-shadow px-6 py-4 flex flex-col z-40 border border-gray-50">
                   <span className="text-[24px] font-black text-[#111]">100%</span>
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mobile Ready</span>
                </div>
             </div>

          </div>
        </section>

        {/* 🚀 FAQS SECTION */}
        <section id="faqs" className="py-24 px-6 lg:px-10 max-w-[900px] mx-auto relative z-10 border-t border-gray-100">
          <h2 className="text-[2.5rem] md:text-[3rem] font-black text-center text-[#111] tracking-tight mb-16 text-super-tight">{t.faqs.title}</h2>
          <div className="space-y-4">
            {t.faqs.questions.map((faq, i) => (
              <div key={i} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-[#111] transition-all techflow-shadow group cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex justify-between items-center">
                  <span className={`font-black text-[#111] text-[16px] md:text-[18px] ${isUrdu ? "text-right w-full" : ""}`}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="text-[#111] shrink-0 ml-4" size={24}/> : <ChevronDown className="text-gray-400 group-hover:text-[#111] shrink-0 ml-4 transition-colors" size={24}/>}
                </div>
                {openFaq === i && (
                  <p className={`mt-4 text-[#555] text-[15px] font-medium leading-relaxed ${isUrdu ? "text-right" : "text-left"}`}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 🚀 FINAL CTA SECTION */}
        <section className="bg-[#0b0b0b] pt-24 pb-12 mt-20">
          <div className="max-w-4xl mx-auto px-6 text-center mb-16">
            <h2 className="text-[2.5rem] md:text-[3.5rem] font-black text-white mb-10 text-super-tight leading-[1.2]">
              {t.footer.cta}
            </h2>
            <Link href="/login" className="bg-white text-[#0b0b0b] px-10 py-5 rounded-xl font-black text-[16px] hover:bg-gray-200 transition-all inline-block">
               {t.nav.loginBtn}
            </Link>
          </div>

          <footer className="max-w-[1300px] mx-auto px-6 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2 text-white opacity-90">
              <div className="bg-white p-1.5 rounded-[4px]"><ShieldCheck size={18} className="text-[#0b0b0b]" /></div>
              <span className="text-lg font-black tracking-wide">{t.footer.rights}</span>
            </div>
            <div className="font-bold text-[13px] text-gray-400 uppercase tracking-widest text-center md:text-right">
                {t.footer.contact}
            </div>
          </footer>
        </section>

      </div>
    </div>
  );
}
