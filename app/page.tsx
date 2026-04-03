"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Globe, ChevronDown, ChevronUp, CheckCircle2,
  FileText, Users, CreditCard, ShieldCheck
} from "lucide-react";

export default function EduPilotLanding() {
  const [lang, setLang] = useState<"UR" | "EN">("UR");
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [liveStats, setLiveStats] = useState({
    students: 0,
    fees: 0,
    attendance: "94.2%" 
  });

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setLiveStats(prev => ({ ...prev, students: snap.size }));
    });
    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let total = 0;
      snap.forEach(doc => total += Number(doc.data().grandTotal || 0));
      setLiveStats(prev => ({ ...prev, fees: total }));
    });
    return () => { unsubStudents(); unsubFees(); };
  }, []);

  const isUrdu = lang === "UR";
  const dir = isUrdu ? "rtl" : "ltr";

  // --- CONTENT DICTIONARY ---
  const content = {
    UR: {
      nav: { features: "خصوصیات", faqs: "سوالات", loginBtn: "سائن ان" },
      hero: {
        badge: "پاکستانی اسکولوں کے لیے",
        title1: "پاکستان کا پہلا AI سے",
        title2: "تقویت یافتہ اسکول مینجمنٹ سسٹم",
        desc: "EduPilot اسکول مالکان اور منتظمین کو اردو یا انگریزی میں روزمرہ کے کاموں میں مدد کرتا ہے۔ بلٹ ان AI، فیس، حاضری، رپورٹ کارڈز، اور بہت کچھ۔",
        stats: { schools: "اسکول", attendance: "آج کی حاضری", students: "طلبہ کا انتظام", fee: "فیس کلیکشن" }
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
      footer: { rights: "EduPilot. All rights reserved 2026 ©", links: ["پروڈکٹ", "فیچرز", "بلاگ", "پرائیویسی پالیسی", "رابطہ"] }
    },
    EN: {
      nav: { features: "Features", faqs: "FAQs", loginBtn: "Sign In" },
      hero: { badge: "For Pakistani Schools", title1: "Pakistan's First AI Powered", title2: "School Management System", desc: "Manage everything from fees to AI generated results in Urdu & English.", stats: { schools: "Schools", attendance: "Today's Attendance", students: "Students Enrolled", fee: "Fee Collected" } },
      why: { title: "Why School Owners Choose EduPilot", cards: [ { title: "Simplify Fee Collection", desc: "Track payments and dues." }, { title: "Reduce Office Work", desc: "Manage records from one place." }, { title: "Fast Results", desc: "Generate report cards instantly." }, { title: "Bilingual UI", desc: "Use comfortably in Urdu or English." } ] },
      tabs: { title: "See EduPilot in Action", menus: ["Fee Management", "Attendance", "Results & Cards", "Students & Staff"], data: [ { title: "Track Payments", desc: "Track payments\nSee payment status\nClean financial records" }, { title: "Smart Attendance", desc: "Mark daily attendance\nAbsent reports\nAuto SMS" }, { title: "AI Result Cards", desc: "Auto grading\nSmart remarks\nPrintable results" }, { title: "HR Management", desc: "Staff biodata\nSalary records\nStudent profiles" } ] },
      faqs: { title: "Questions? We have answers.", questions: [ { q: "No technical training needed?", a: "Yes, it is designed for ease of use." }, { q: "Does it support Urdu?", a: "Yes 100%." }, { q: "Mobile friendly?", a: "Yes, fully responsive." }, { q: "Setup time?", a: "Takes just a few minutes." }, { q: "All in one place?", a: "Yes, complete ERP." }, { q: "Made for Pakistan?", a: "Yes, tailored for local needs." }, { q: "Onboarding support?", a: "Yes, full support provided." } ] },
      footer: { rights: "EduPilot. All rights reserved 2026 ©", links: ["Product", "Features", "Blog", "Privacy", "Contact"] }
    }
  };

  const t = isUrdu ? content.UR : content.EN;

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden ${isUrdu ? "font-urdu" : ""}`} dir={dir}>
      
      {/* 1. HERO SECTION WITH BACKGROUND IMAGE */}
      <div 
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=2000')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark Premium Overlay */}
        <div className="absolute inset-0 bg-[#0F172A]/85 z-0"></div>

        {/* Navbar */}
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-[#EAB308] p-1.5 rounded-md"><ShieldCheck size={20} className="text-[#0F172A]" /></div>
            <span className="text-xl font-bold tracking-wide">EduPilot</span>
          </div>

          <div className="hidden lg:flex items-center gap-12 text-gray-300 text-sm font-bold">
            <a href="#features" className="cursor-pointer hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#faqs" className="cursor-pointer hover:text-white transition-colors">{t.nav.faqs}</a>
            
            <div className="flex bg-white/10 rounded-full p-1 ml-4 border border-white/20 backdrop-blur-sm">
              <button onClick={() => setLang("EN")} className={`px-4 py-1 rounded-full text-xs transition-colors ${!isUrdu ? "bg-white text-[#0F172A] font-bold" : "text-white"}`}>English</button>
              <button onClick={() => setLang("UR")} className={`px-4 py-1 rounded-full text-xs transition-colors ${isUrdu ? "bg-white text-[#0F172A] font-bold" : "text-white"}`}>اردو</button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
             <Link href="/login" className="bg-[#EAB308] text-[#0F172A] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors shadow-lg">
               {t.nav.loginBtn}
             </Link>
          </div>
        </nav>

        {/* Centered Hero Content */}
        <div className="container mx-auto px-6 py-12 flex flex-col items-center text-center relative z-10 flex-1">
             <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-10 backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse"></span>
               <span className="text-gray-200 text-xs font-bold tracking-wider uppercase">{t.hero.badge}</span>
             </div>
             
             <div className="mb-6 max-w-4xl">
                 <div className={`${isUrdu ? "pb-8" : "pb-4"}`}>
                    <h1 
                      className={`font-bold text-white ${isUrdu ? "text-4xl lg:text-6xl" : "text-4xl lg:text-6xl"}`}
                      style={{ lineHeight: isUrdu ? '2.2' : '1.2' }}
                    >
                      {t.hero.title1}
                    </h1>
                 </div>
                 <div>
                    <h1 
                      className={`font-bold ${isUrdu ? 'text-gray-300 text-4xl lg:text-5xl' : 'text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 text-4xl lg:text-6xl'}`}
                      style={{ lineHeight: isUrdu ? '2.2' : '1.2' }}
                    >
                      {t.hero.title2}
                    </h1>
                 </div>
             </div>
             
             <p className="text-gray-300 text-lg max-w-2xl mx-auto" style={{ lineHeight: isUrdu ? '2.2' : '1.6' }}>
               {t.hero.desc}
             </p>
             
             {/* Centered Mockup with Floating Cards */}
             <div className="relative w-full max-w-5xl mt-20 h-[350px] lg:h-[450px]">
                {/* Main Laptop Frame */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[70%] h-full bg-[#1E293B] rounded-t-2xl border-[6px] border-b-0 border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-10">
                   <div className="h-6 bg-gray-800 flex items-center px-3 gap-2 border-b border-gray-700">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                   </div>
                   <div className="flex-1 bg-[#F8F9FE] p-4 flex flex-col gap-3">
                      <div className="h-6 w-1/3 bg-gray-200 rounded-md"></div>
                      <div className="flex gap-3 h-24">
                        <div className="flex-1 bg-white shadow-sm border border-gray-100 rounded-lg"></div>
                        <div className="flex-1 bg-white shadow-sm border border-gray-100 rounded-lg"></div>
                      </div>
                      <div className="flex-1 bg-white shadow-sm border border-gray-100 rounded-lg mt-2"></div>
                   </div>
                </div>
                {/* Laptop Base */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[98%] md:w-[80%] h-4 bg-gray-300 rounded-b-xl z-20 shadow-2xl"></div>

                {/* Floating Glass Cards - Positioned Around */}
                <div className="absolute top-10 right-0 md:right-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-xl z-30">
                  <p className="text-gray-200 text-xs mb-1 font-bold uppercase tracking-wider">{t.hero.stats.schools}</p>
                  <p className="text-white font-black text-2xl">1 (EduPilot)</p>
                </div>

                <div className="absolute top-1/4 left-0 md:left-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-xl z-30">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-gray-200 text-xs font-bold uppercase tracking-wider">{t.hero.stats.attendance}</p>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  </div>
                  <p className="text-white font-black text-2xl">{liveStats.attendance}</p>
                </div>

                <div className="absolute bottom-16 left-4 md:left-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-xl z-30">
                  <p className="text-gray-200 text-xs mb-1 font-bold uppercase tracking-wider">{t.hero.stats.students} (Live)</p>
                  <p className="text-white font-black text-3xl">{liveStats.students}</p>
                </div>

                <div className="absolute bottom-20 right-4 md:right-16 bg-[#EAB308]/90 backdrop-blur-md border border-[#EAB308]/50 p-5 rounded-2xl shadow-2xl z-30 flex items-center gap-4 hover:scale-105 transition-transform">
                  <div className="bg-white p-2.5 rounded-lg"><CreditCard size={20} className="text-[#0F172A]"/></div>
                  <div className="text-left">
                    <p className="text-[#0F172A] text-xs font-bold uppercase tracking-wider opacity-80">{t.hero.stats.fee} (Live)</p>
                    <p className="text-[#0F172A] font-black text-xl">PKR {liveStats.fees.toLocaleString()}</p>
                  </div>
                </div>
             </div>
        </div>
      </div>

      {/* 2. FEATURES SECTION */}
      <div id="features" className="py-24 bg-white container mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] text-center mb-16 pb-4" style={{ lineHeight: isUrdu ? '2.5' : '1.3' }}>{t.why.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {t.why.cards.map((card, i) => (
            <div key={i} className="bg-gray-50 rounded-[35px] p-10 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-8 text-blue-600 shadow-sm">
                {i === 0 ? <CreditCard size={28}/> : i === 1 ? <Users size={28}/> : i === 2 ? <FileText size={28}/> : <Globe size={28}/>}
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-4 pb-2">{card.title}</h3>
              <p className="text-gray-500 text-base" style={{ lineHeight: isUrdu ? '2.2' : '1.6' }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. INTERACTIVE TABS */}
      <div className="py-24 bg-gray-50 container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#EAB308] text-sm font-bold mb-4">پروڈکٹ</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] mb-12 pb-4" style={{ lineHeight: isUrdu ? '2.5' : '1.3' }}>{t.tabs.title}</h2>
          <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-full max-w-fit mx-auto border border-gray-200 shadow-sm">
            {t.tabs.menus.map((menu, i) => (
              <button key={i} onClick={() => setActiveTab(i)} className={`px-8 py-3 rounded-full text-base font-bold transition-all ${activeTab === i ? 'bg-[#0F172A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                {menu}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="lg:w-1/3 bg-white p-10 rounded-[35px] shadow-lg border border-gray-100">
            <h3 className="text-3xl font-bold text-[#0F172A] mb-8 pb-4 border-b border-gray-50">{t.tabs.data[activeTab].title}</h3>
            <ul className="space-y-6 mb-10">
              {t.tabs.data[activeTab].desc.split('\n').map((line, i) => (
                <li key={i} className="flex items-start gap-4 text-gray-600 text-base" style={{ lineHeight: isUrdu ? '2.2' : '1.6' }}>
                  <CheckCircle2 size={24} className="text-green-500 shrink-0 mt-1" /><span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-2/3 bg-white rounded-3xl shadow-xl border border-gray-200 p-2 overflow-hidden h-[400px] w-full flex flex-col">
             <div className="h-10 bg-gray-50 flex items-center px-4 gap-2 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="ml-4 bg-white px-4 py-1 rounded text-[10px] text-gray-400 border border-gray-200 flex-1 text-center font-sans">app.edupilot.com/portal</div>
             </div>
             
             <div className="flex-1 bg-[#F8F9FE] p-6 overflow-hidden">
                {activeTab === 0 && ( 
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"><span className="font-bold text-sm text-[#0F172A]">Ahmad Khan (Class 5)</span><span className="bg-green-100 text-green-600 px-3 py-1 rounded text-xs font-bold">Paid: 5000</span></div>
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"><span className="font-bold text-sm text-[#0F172A]">Fatima Ali (Class 6)</span><span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded text-xs font-bold">Pending: 3000</span></div>
                  </div>
                )}
                {activeTab === 1 && ( 
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"><span className="font-bold text-sm text-[#0F172A]">Ahmad Khan</span><div className="flex gap-2"><div className="w-8 h-8 rounded bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-md">P</div><div className="w-8 h-8 rounded border text-gray-300 flex items-center justify-center font-bold text-xs">A</div></div></div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* 4. FAQs SECTION */}
      <div id="faqs" className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] text-center mb-16 pb-4" style={{ lineHeight: isUrdu ? '2.5' : '1.3' }}>{t.faqs.title}</h2>
          <div className="space-y-6">
            {t.faqs.questions.map((faq, i) => (
              <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-[#EAB308]">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center text-[#0F172A] focus:outline-none cursor-pointer z-10 relative"
                >
                  <span className={`font-bold text-lg ${isUrdu ? "text-right w-full" : ""}`}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={24} className="text-[#EAB308] shrink-0 ml-4"/> : <ChevronDown size={24} className="text-gray-400 shrink-0 ml-4"/>}
                </button>
                {openFaq === i && (
                  <div className={`px-8 pb-8 text-gray-600 text-base border-t border-gray-50 pt-4 ${isUrdu ? "text-right" : "text-left"}`} style={{ lineHeight: isUrdu ? '2.2' : '1.6' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. FINAL CTA SECTION */}
      <div className="bg-[#0F172A] pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-10 pb-4" style={{ lineHeight: isUrdu ? '2.5' : '1.3' }}>
            {isUrdu ? "اسکول مینجمنٹ آسان بنانے کے لیے تیار ہیں؟" : "Ready to simplify school management?"}
          </h2>
        </div>

        <footer className="container mx-auto px-6 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
           <div className="flex items-center gap-2 text-white">
            <div className="bg-[#EAB308] p-1.5 rounded-md"><ShieldCheck size={20} className="text-[#0F172A]" /></div>
            <span className="text-xl font-bold">EduPilot</span>
          </div>
          <div className="font-bold text-sm text-gray-400 font-mono tracking-widest uppercase">
              Imran Haider Sandhu <br/>
              03004134853 (Call/WA)
          </div>
        </footer>
      </div>
    </div>
  );
}
