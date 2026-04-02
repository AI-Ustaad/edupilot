"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
// VERCEL BUILD ERROR FIXED: Changed path to ../lib/firebase
import { db } from "../lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Globe, Menu, X, CheckCircle2, ChevronDown, ChevronUp,
  Smartphone, Monitor, FileText, Users, CreditCard,
  MessageCircle, PlayCircle, ShieldCheck
} from "lucide-react";

export default function EduPilotLanding() {
  const [lang, setLang] = useState<"UR" | "EN">("UR");
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Real-Time Data Syncing State
  const [liveStats, setLiveStats] = useState({
    students: 0,
    fees: 0,
    attendance: "94.2%" 
  });

  // Fetch Real Data from Firebase
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
  const whatsappLink = "https://wa.me/923004134853"; 

  // --- CONTENT DICTIONARY ---
  const content = {
    UR: {
      nav: {
        features: "خصوصیات", blog: "بلاگ", faqs: "سوالات", city: "شہر",
        demoBtn: "ڈیمو آزمائیں", loginBtn: "سائن ان"
      },
      hero: {
        badge: "پاکستانی اسکولوں کے لیے",
        title1: "پاکستان کا پہلا AI سے",
        title2: "تقویت یافتہ اسکول",
        title3: "مینجمنٹ سسٹم",
        desc: "EduPilot اسکول مالکان اور منتظمین کو اردو یا انگریزی میں روزمرہ کے کاموں میں مدد کرتا ہے۔ بلٹ ان AI، فیس، حاضری، رپورٹ کارڈز، اور بہت کچھ۔",
        demoBtn: "مفت ڈیمو بک کریں",
        waBtn: "واٹس ایپ کریں",
        liveDemo: "لائیو ڈیمو آزمائیں",
        stats: { schools: "اسکول", attendance: "آج کی حاضری", students: "طلبہ کا انتظام", fee: "فیس کلیکشن" }
      },
      why: {
        title: "اسکول مالکان EduPilot کیوں منتخب کرتے ہیں",
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
          { title: "ادائیگیاں اور واجبات ٹریک کریں", desc: "ادائیگیاں اور واجبات ٹریک کریں\nادائیگی کی حالت فوری دیکھیں\nصاف مالی ریکارڈ رکھیں", btn: "مفت ڈیمو بک کریں" },
          { title: "سمارٹ حاضری کا نظام", desc: "روزانہ حاضری سیکنڈوں میں لگائیں\nغائب طلباء کی رپورٹس\nوالدین کو آٹو ایس ایم ایس", btn: "حاضری ڈیمو دیکھیں" },
          { title: "AI رزلٹ کارڈ جنریٹر", desc: "خودکار گریڈنگ اور پرسنٹیج\nٹیچر کے سمارٹ تبصرے\nون پیج پرنٹ ایبل رزلٹ", btn: "رپورٹ کارڈز دیکھیں" },
          { title: "مکمل ایچ آر مینجمنٹ", desc: "اسٹاف کی مکمل بائیو ڈیٹا\nتنخواہوں کا ریکارڈ\nطلباء کی تفصیلی پروفائلز", btn: "ڈیمو آزمائیں" }
        ]
      },
      dual: {
        card1: { title: "جہاں اسکول کا کام ہوتا ہے وہاں کام کرتا ہے", desc: "EduPilot فون، ٹیبلٹ یا ڈیسک ٹاپ پر استعمال کریں۔ بغیر کمپیوٹر کے حاضری لگائیں اور فیس چیک کریں۔", list: ["فون سے حاضری لگائیں", "فیس کی صورتحال دیکھیں", "مالکان اور ایڈمن ایک ہی سسٹم میں"] }
      },
      faqs: {
        title: "سوالات؟ ہمارے پاس جوابات ہیں۔",
        desc: "دیکھیں EduPilot آپ کے اسکول کا بہتر انتظام کرنے میں کیسے مدد کر سکتا ہے۔",
        questions: [
          { q: "کیا میرا عملہ تکنیکی ٹریننگ کے بغیر استعمال کر سکتا ہے؟", a: "جی ہاں۔ EduPilot اسکول ٹیموں کے لیے بنایا گیا ہے، آئی ٹی ماہرین کے لیے نہیں۔ زیادہ تر اسکول منٹوں میں استعمال شروع کر دیتے ہیں۔" },
          { q: "کیا EduPilot اردو سپورٹ کرتا ہے؟", a: "بالکل، ہمارا سسٹم اردو زبان کو 100% سپورٹ کرتا ہے۔" },
          { q: "کیا ہم موبائل فون پر استعمال کر سکتے ہیں؟", a: "جی ہاں، EduPilot مکمل طور پر موبائل ریسپانسیو ہے۔" },
          { q: "سیٹ اپ میں کتنا وقت لگتا ہے؟", a: "سیٹ اپ بہت آسان ہے۔ آپ چند منٹوں میں طلبہ کا ڈیٹا شامل کر کے کام شروع کر سکتے ہیں۔" },
          { q: "کیا ہم فیس، حاضری اور نتائج ایک جگہ منظم کر سکتے ہیں؟", a: "جی ہاں، یہ ایک مکمل ERP ہے جہاں آپ سب کچھ ایک ڈیش بورڈ سے کنٹرول کر سکتے ہیں۔" },
          { q: "کیا یہ پاکستانی اسکولوں کے لیے بنایا گیا ہے؟", a: "جی ہاں، یہ خاص طور پر پاکستانی اسکولوں، B-Form سسٹم اور مقامی نصاب کے مطابق ڈیزائن کیا گیا ہے۔" },
          { q: "کیا آپ آن بورڈنگ سپورٹ فراہم کرتے ہیں؟", a: "جی ہاں، ہماری ٹیم مکمل آن بورڈنگ اور سیٹ اپ میں آپ کی رہنمائی کرتی ہے۔" }
        ]
      },
      footer: {
        rights: "EduPilot. All rights reserved 2026 ©",
        links: ["پروڈکٹ", "فیچرز", "ڈیمو آزمائیں", "بلاگ", "پرائیویسی پالیسی", "شرائط و ضوابط", "سوالات ہمارے پاس", "رابطہ"]
      }
    },
    EN: {
      nav: { features: "Features", blog: "Blog", faqs: "FAQs", city: "Cities", demoBtn: "Try Demo", loginBtn: "Sign In" },
      hero: { badge: "For Pakistani Schools", title1: "Pakistan's First AI", title2: "Powered School", title3: "Management System", desc: "Manage everything from fees to AI generated results in Urdu & English.", demoBtn: "Book Free Demo", waBtn: "WhatsApp Us", liveDemo: "Live Demo", stats: { schools: "Schools", attendance: "Today's Attendance", students: "Students Enrolled", fee: "Fee Collected" } },
      why: { title: "Why School Owners Choose EduPilot", cards: [ { title: "Simplify Fee Collection", desc: "Track payments and dues." }, { title: "Reduce Office Work", desc: "Manage records from one place." }, { title: "Fast Results", desc: "Generate report cards instantly." }, { title: "Bilingual UI", desc: "Use comfortably in Urdu or English." } ] },
      tabs: { title: "See EduPilot in Action", menus: ["Fee Management", "Attendance", "Results & Cards", "Students & Staff"], data: [ { title: "Track Payments", desc: "Track payments\nSee payment status\nClean financial records", btn: "Book Demo" }, { title: "Smart Attendance", desc: "Mark daily attendance\nAbsent reports\nAuto SMS", btn: "See Demo" }, { title: "AI Result Cards", desc: "Auto grading\nSmart remarks\nPrintable results", btn: "View Reports" }, { title: "HR Management", desc: "Staff biodata\nSalary records\nStudent profiles", btn: "Try Demo" } ] },
      dual: { card1: { title: "Works wherever school work happens", desc: "Use on phone, tablet or desktop.", list: ["Mark attendance from phone", "Check fee status", "Owners & admins combined"] } },
      faqs: { title: "Questions? We have answers.", desc: "See how EduPilot helps you.", questions: [ { q: "No technical training needed?", a: "Yes, it is designed for ease of use." }, { q: "Does it support Urdu?", a: "Yes 100%." }, { q: "Mobile friendly?", a: "Yes, fully responsive." }, { q: "Setup time?", a: "Takes just a few minutes." }, { q: "All in one place?", a: "Yes, complete ERP." }, { q: "Made for Pakistan?", a: "Yes, tailored for local needs." }, { q: "Onboarding support?", a: "Yes, full support provided." } ] },
      footer: { rights: "EduPilot. All rights reserved 2026 ©", links: ["Product", "Features", "Try Demo", "Blog", "Privacy", "Terms", "FAQs", "Contact"] }
    }
  };

  const t = isUrdu ? content.UR : content.EN;

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden ${isUrdu ? "font-urdu" : ""}`} dir={dir}>
      
      {/* 1. HERO SECTION (Dark Navy) */}
      <div className="bg-[#0F172A] min-h-screen relative overflow-hidden flex flex-col">
        {/* Navbar */}
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-[#EAB308] p-1.5 rounded-md"><ShieldCheck size={20} className="text-[#0F172A]" /></div>
            <span className="text-xl font-bold tracking-wide">EduPilot</span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-gray-300 text-sm">
            <span className="cursor-pointer hover:text-white transition-colors">{t.nav.features}</span>
            <span className="cursor-pointer hover:text-white transition-colors">{t.nav.blog}</span>
            <span className="cursor-pointer hover:text-white transition-colors">{t.nav.faqs}</span>
            
            <div className="flex bg-white/10 rounded-full p-1 ml-4 border border-white/20">
              <button onClick={() => setLang("EN")} className={`px-4 py-1 rounded-full text-xs transition-colors ${!isUrdu ? "bg-white text-[#0F172A] font-bold" : "text-white"}`}>English</button>
              <button onClick={() => setLang("UR")} className={`px-4 py-1 rounded-full text-xs transition-colors ${isUrdu ? "bg-white text-[#0F172A] font-bold" : "text-white"}`}>اردو</button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
             <Link href="/login" className="text-gray-300 hover:text-white text-sm border border-white/20 px-4 py-2 rounded-lg">{t.nav.demoBtn}</Link>
             <Link href="/login" className="bg-[#EAB308] text-[#0F172A] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors">
               {t.nav.loginBtn}
             </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-16 relative z-10 flex-1">
           <div className={`lg:w-1/2 ${isUrdu ? "lg:pl-10" : "lg:pr-10"}`}>
             <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
               <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
               <span className="text-gray-300 text-xs">{t.hero.badge}</span>
             </div>
             
             <h1 className={`text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 ${isUrdu ? "leading-[1.4]" : ""}`}>
               {t.hero.title1} <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">{t.hero.title2}</span> <br/>
               {t.hero.title3}
             </h1>
             <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-xl">{t.hero.desc}</p>
             
             <div className="flex flex-wrap items-center gap-4">
               <Link href="/login" className="bg-[#EAB308] text-[#0F172A] px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center gap-2">
                 {t.hero.demoBtn}
               </Link>
               <a href={whatsappLink} target="_blank" rel="noreferrer" className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center gap-2">
                 <MessageCircle size={20} /> {t.hero.waBtn}
               </a>
               <Link href="/login" className="text-white px-6 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/10 transition-all flex items-center gap-2 mt-4 sm:mt-0">
                 {t.hero.liveDemo}
               </Link>
             </div>
           </div>

           <div className="lg:w-1/2 relative w-full h-[400px] lg:h-[500px]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[#1E293B] rounded-xl border-4 border-gray-800 shadow-2xl flex flex-col overflow-hidden z-10">
                 <div className="h-6 bg-gray-800 flex items-center px-2 gap-1.5 border-b border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
                 <div className="flex-1 bg-white p-4 flex flex-col gap-2 opacity-50">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="flex gap-2 h-20"><div className="flex-1 bg-blue-50 rounded"></div><div className="flex-1 bg-green-50 rounded"></div></div>
                 </div>
              </div>

              <div className="absolute top-10 right-0 lg:-right-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl z-20">
                <p className="text-gray-300 text-xs mb-1">{t.hero.stats.schools}</p>
                <p className="text-white font-bold text-2xl">1 (EduPilot)</p>
              </div>

              <div className="absolute top-20 left-0 lg:-left-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl z-20">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-gray-300 text-xs">{t.hero.stats.attendance}</p>
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                </div>
                <p className="text-white font-bold text-xl">{liveStats.attendance}</p>
              </div>

              {/* REAL DATA FROM FIREBASE */}
              <div className="absolute bottom-10 right-10 bg-[#EAB308]/90 backdrop-blur-md border border-[#EAB308]/50 p-4 rounded-2xl shadow-xl z-20">
                <p className="text-[#0F172A] text-xs mb-1 font-bold">{t.hero.stats.students} (Live)</p>
                <p className="text-[#0F172A] font-black text-3xl">{liveStats.students}</p>
              </div>

              <div className="absolute bottom-4 left-4 lg:-left-4 bg-green-500/90 backdrop-blur-md border border-green-400 p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg"><CreditCard size={16} className="text-green-600"/></div>
                <div>
                  <p className="text-green-50 text-xs font-bold">{t.hero.stats.fee} (Live)</p>
                  <p className="text-white font-black text-lg">PKR {liveStats.fees.toLocaleString()}</p>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. WHY CHOOSE US */}
      <div className="py-24 bg-white container mx-auto px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] text-center mb-16">{t.why.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {t.why.cards.map((card, i) => (
            <div key={i} className="bg-gray-50 rounded-3xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-6 text-blue-600">
                {i === 0 ? <CreditCard size={20}/> : i === 1 ? <Users size={20}/> : i === 2 ? <FileText size={20}/> : <Globe size={20}/>}
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">{card.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. INTERACTIVE TABS */}
      <div className="py-24 bg-gray-50 container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[#EAB308] text-sm font-bold mb-2">پروڈکٹ</p>
          <h2 className="text-3xl lg:text-5xl font-bold text-[#0F172A] mb-10">{t.tabs.title}</h2>
          <div className="flex flex-wrap justify-center gap-2 bg-white p-2 rounded-full max-w-fit mx-auto border border-gray-200 shadow-sm">
            {t.tabs.menus.map((menu, i) => (
              <button key={i} onClick={() => setActiveTab(i)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === i ? 'bg-[#0F172A] text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {menu}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 mt-16">
          <div className="lg:w-1/3 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-6">{t.tabs.data[activeTab].title}</h3>
            <ul className="space-y-4 mb-8">
              {t.tabs.data[activeTab].desc.split('\n').map((line, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /><span>{line}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="block text-center w-full bg-[#EAB308] text-[#0F172A] py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
              {t.tabs.data[activeTab].btn}
            </Link>
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
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"><span className="font-bold text-sm text-[#0F172A]">Usman Raza (Class 9)</span><span className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold">Overdue: 8000</span></div>
                  </div>
                )}
                {activeTab === 1 && ( 
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"><span className="font-bold text-sm text-[#0F172A]">Ahmad Khan</span><div className="flex gap-2"><div className="w-8 h-8 rounded bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-md">P</div><div className="w-8 h-8 rounded border text-gray-300 flex items-center justify-center font-bold text-xs">A</div></div></div>
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"><span className="font-bold text-sm text-[#0F172A]">Zainab Bibi</span><div className="flex gap-2"><div className="w-8 h-8 rounded border text-gray-300 flex items-center justify-center font-bold text-xs">P</div><div className="w-8 h-8 rounded bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-md">A</div></div></div>
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"><span className="font-bold text-sm text-[#0F172A]">Usman Raza</span><div className="flex gap-2"><div className="w-8 h-8 rounded border text-gray-300 flex items-center justify-center font-bold text-xs">P</div><div className="w-8 h-8 rounded bg-yellow-400 text-white flex items-center justify-center font-bold text-xs shadow-md">L</div></div></div>
                  </div>
                )}
                {activeTab === 2 && ( 
                  <div className="bg-white border-[6px] border-[#0F172A] p-4 h-full shadow-sm font-sans flex flex-col">
                    <div className="text-center border-b pb-2 mb-2"><h4 className="font-black text-[#0F172A] text-lg">EDUPILOT SCHOOL</h4><p className="text-[8px] text-gray-400 uppercase tracking-widest">Result Card 2026</p></div>
                    <table className="w-full text-left text-xs mb-2">
                      <thead className="bg-[#0F172A] text-white"><tr><th className="p-2">Subject</th><th className="p-2">Obt</th><th className="p-2">Grade</th></tr></thead>
                      <tbody><tr className="border-b"><td className="p-2">Math</td><td className="p-2">95</td><td className="p-2 text-green-500 font-bold">A+</td></tr><tr><td className="p-2">Urdu</td><td className="p-2">82</td><td className="p-2 text-blue-500 font-bold">A</td></tr></tbody>
                    </table>
                  </div>
                )}
                {activeTab === 3 && ( 
                  <div className="grid grid-cols-2 gap-4 font-sans">
                    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">FA</div><div><p className="font-bold text-sm text-[#0F172A]">Faisal Ali</p><p className="text-[10px] text-gray-400">Math Teacher</p></div></div>
                    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">SA</div><div><p className="font-bold text-sm text-[#0F172A]">Sara Ahmed</p><p className="text-[10px] text-gray-400">Principal</p></div></div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* 4. DUAL FEATURE HIGHLIGHT */}
      <div className="py-24 bg-white container mx-auto px-6 flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="bg-gray-50 rounded-[40px] p-10 border border-gray-100 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
             <div className="md:w-1/2 z-10">
               <p className="text-[#EAB308] text-sm font-bold mb-2">موبائل فرسٹ</p>
               <h3 className="text-3xl font-bold text-[#0F172A] mb-4">{t.dual.card1.title}</h3>
               <p className="text-gray-500 text-sm leading-relaxed mb-8">{t.dual.card1.desc}</p>
               <ul className="space-y-4">
                 {t.dual.card1.list.map((item, i) => (
                   <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-50 max-w-sm">
                     <div className="bg-[#0F172A] rounded-full p-1"><CheckCircle2 size={12} className="text-white"/></div>
                     <span className="text-sm font-medium text-gray-700">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>
             
             <div className="md:w-1/2 flex justify-center z-10">
               <div className="w-64 h-96 bg-[#0F172A] rounded-[30px] border-8 border-gray-800 shadow-2xl p-4 flex flex-col font-sans">
                 <div className="bg-white flex-1 rounded-xl p-3 flex flex-col gap-2">
                   <div className="h-3 w-1/2 bg-gray-200 rounded mx-auto mb-4"></div>
                   <div className="h-10 bg-gray-100 rounded-lg flex items-center justify-between px-2"><div className="w-4 h-4 rounded-full bg-red-400"></div><div className="w-1/2 h-2 bg-gray-300 rounded"></div></div>
                   <div className="h-10 bg-gray-100 rounded-lg flex items-center justify-between px-2"><div className="w-4 h-4 rounded-full bg-green-400"></div><div className="w-1/2 h-2 bg-gray-300 rounded"></div></div>
                   <div className="mt-auto h-8 bg-[#EAB308] rounded-lg"></div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 5. FAQs & FINAL CTA */}
      <div className="bg-[#0F172A] pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-12">{t.faqs.title}</h2>
          <div className="space-y-4">
            {t.faqs.questions.map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-6 py-5 text-left flex justify-between items-center text-white font-medium focus:outline-none">
                  <span className={isUrdu ? "text-right w-full block font-bold" : ""}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={20} className="text-gray-400 shrink-0"/> : <ChevronDown size={20} className="text-gray-400 shrink-0"/>}
                </button>
                {openFaq === i && (
                  <div className={`px-6 pb-5 text-gray-400 text-sm leading-relaxed ${isUrdu ? "text-right" : "text-left"}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center border-t border-white/10 pt-16 mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">اسکول مینجمنٹ آسان بنانے کے لیے تیار ہیں؟</h2>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
             <Link href="/login" className="bg-[#EAB308] text-[#0F172A] px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all">مفت ڈیمو بک کریں</Link>
             <Link href="/login" className="text-white px-8 py-3 rounded-lg font-bold border border-white/20 hover:bg-white/10 transition-all">لائیو ڈیمو آزمائیں</Link>
             <a href={whatsappLink} target="_blank" rel="noreferrer" className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                 <MessageCircle size={18} /> واٹس ایپ کریں
             </a>
          </div>
        </div>

        <footer className="container mx-auto px-6 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
           <div className="flex items-center gap-2 text-white">
            <div className="bg-[#EAB308] p-1 rounded-sm"><ShieldCheck size={16} className="text-[#0F172A]" /></div>
            <span className="text-lg font-bold">EduPilot</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-right w-full md:w-auto">
             <div className="flex flex-col gap-3">{t.footer.links.slice(0,2).map((l,i) => <span key={i} className="text-gray-400 text-sm hover:text-white cursor-pointer">{l}</span>)}</div>
             <div className="flex flex-col gap-3">{t.footer.links.slice(2,4).map((l,i) => <span key={i} className="text-gray-400 text-sm hover:text-white cursor-pointer">{l}</span>)}</div>
             <div className="flex flex-col gap-3">{t.footer.links.slice(4,6).map((l,i) => <span key={i} className="text-gray-400 text-sm hover:text-white cursor-pointer">{l}</span>)}</div>
             <div className="flex flex-col gap-3">
               {t.footer.links.slice(6,8).map((l,i) => <span key={i} className="text-gray-400 text-sm hover:text-white cursor-pointer">{l}</span>)}
               <span className="text-gray-400 text-sm mt-2 font-mono">info@edupilot.com</span>
               <span className="text-gray-400 text-sm font-mono">+92 300 4134853</span>
             </div>
          </div>
        </footer>
        <div className="text-center text-gray-600 text-xs mt-12">{t.footer.rights}</div>
      </div>
    </div>
  );
}
