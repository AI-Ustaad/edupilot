"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Globe, Menu, X, CheckCircle2, ChevronDown, ChevronUp,
  Monitor, FileText, Users, CreditCard,
  MessageCircle, ShieldCheck
} from "lucide-react";

export default function EduPilotLanding() {
  const [lang, setLang] = useState<"UR" | "EN">("UR");
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Live Real-Time Data Syncing State (Image 6)
  const [liveStats, setLiveStats] = useState({
    students: 0,
    fees: 0,
    attendance: "94.2%" 
  });

  // Fetch Real Data from Firebase (../lib/firebase fixed)
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
  const whatsappLink = "https://wa.me/923004134853"; // 1st Fix: correct phone number
  // 4th Fix: Pre-filled WhatsApp message for booking a demo
  const bookDemoLink = "https://wa.me/923004134853?text=السلام%20علیکم!%20میں%20EduPilot%20سافٹ%20ویئر%20کا%20مفت%20ڈیمو%20بک%20کرنا%20چاہتا%20ہوں۔";

  // --- CONTENT DICTIONARY ---
  const content = {
    UR: {
      nav: { features: "خصوصیات", blog: "بلاگ", faqs: "سوالات", city: "شہر", demoBtn: "ڈیمو آزمائیں", loginBtn: "سائن ان" },
      hero: {
        badge: "پاکستانی اسکولوں کے لیے",
        title1: "پاکستان کا پہلا AI سے",
        title2: "تقویت یافتہ اسکول",
        title3: "مینجمنٹ سسٹم",
        desc: "EduPilot اسکول مالکان اور منتظمین کو اردو یا انگریزی میں روزمرہ کے کاموں میں مدد کرتا ہے۔ بلٹ ان AI طلباء کی رپورٹس، والدین کے پیغامات اور فوری سوالات کے لیے — ساتھ ہی فیس، حاضری، رپورٹ کارڈز، تنخواہ اور مزید۔",
        demoBtn: "مفت ڈیمو بک کریں",
        waBtn: "واٹس ایپ کریں",
        liveDemo: "لائیو ڈیمو آزمائیں",
        stats: { schools: "اسکول", attendance: "آج کی حاضری", students: "طلبہ کا انتظام", fee: "فیس کلیکشن" }
      },
      faqs: {
        title: "سوالات؟ ہمارے پاس جوابات ہیں۔",
        // 3rd Fix: All 7 questions added directly from your Image 3
        questions: [
          { q: "کیا میرا عملہ تکنیکی ٹریننگ کے بغیر استعمال کر سکتا ہے؟", a: "جی ہاں۔ EduPilot اسکول ٹیموں کے لیے بنایا گیا ہے، آئی ٹی ماہرین کے لیے نہیں۔ زیادہ تر اسکول منٹوں میں استعمال شروع کر دیتے ہیں۔" },
          { q: "کیا EduPilot اردو سپورٹ کرتا ہے؟", a: "بالکل، ہمارا سسٹم اردو زبان کو 100% سپورٹ کرتا ہے۔" },
          { q: "کیا ہم موبائل فون پر استعمال کر سکتے ہیں؟", a: "جی ہاں، EduPilot مکمل طور پر موبائل ریسپانسیو ہے۔" },
          { q: "سیٹ اپ میں کتنا وقت لگتا ہے؟", a: "سیٹ اپ بہت آسان ہے۔ آپ چند منٹوں میں طلبہ کا ڈیٹا شامل کر کے کام شروع کر سکتے ہیں۔" },
          { q: "کیا ہم فیس، حاضری اور نتائج ایک جگہ منظم کر سکتے ہیں؟", a: "جی ہاں، یہ ایک مکمل ERP ہے جہاں آپ سب کچھ ایک ڈیش بورڈ سے کنٹرول کر سکتے ہیں۔" },
          { q: "کیا یہ پاکستانی اسکولوں کے لیے بنایا گیا ہے؟", a: "جی ہاں، یہ خاص طور پر پاکستانی اسکولوں، B-Form سسٹم اور مقامی نصاب کے مطابق ڈیزائن کیا گیا ہے۔" },
          { q: "کیا آپ آن بورڈنگ سپورٹ فراہم کرتے ہیں؟", a: "جی ہاں، ہماری ٹیم مکمل آن بورڈنگ اور سیٹ اپ میں آپ کی رہنمائی کرتی ہے۔" }
        ]
      }
    },
    EN: {
      nav: { features: "Features", blog: "Blog", faqs: "FAQs", city: "Cities", demoBtn: "Try Demo", loginBtn: "Sign In" },
      hero: { badge: "For Pakistani Schools", title1: "Pakistan's First AI", title2: "Powered School", title3: "Management System", desc: "EduPilot helps school owners and admins manage daily tasks in Urdu or English. Built-in AI for student reports, parent messages, and instant queries — plus fee, attendance, result cards, payroll and more.", demoBtn: "Book Free Demo", waBtn: "WhatsApp Us", liveDemo: "Try Live Demo", stats: { schools: "Schools", attendance: "Today's Attendance", students: "Students Managed", fee: "Fee Collected" } },
      faqs: { title: "Questions? We have answers.", questions: [ { q: "No technical training needed?", a: "Yes, it is designed for ease of use." }, { q: "Does it support Urdu?", a: "Yes 100%." }, { q: "Mobile friendly?", a: "Yes, fully responsive." } ] }
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
             
             {/* THE ULTIMATE FIX FOR URDU OVERLAP: Reduced size and added explicit margins with gap-0 and leading-relaxed */}
             <div className="mb-8 flex flex-col gap-0 leading-relaxed">
                 <h1 className={`text-4xl lg:text-6xl font-bold text-white mb-6 ${isUrdu ? "leading-[2]" : "leading-tight"}`}>
                   {t.hero.title1}
                 </h1>
                 <h1 className={`text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 ${isUrdu ? "leading-[1.8]" : "leading-tight"}`}>
                   {t.hero.title2}
                 </h1>
             </div>
             
             <p className={`text-gray-400 text-lg mb-10 max-w-xl ${isUrdu ? "leading-loose" : "leading-relaxed"}`}>{t.hero.desc}</p>
             
             {/* 3rd Fix: Activated All Functions */}
             <div className="flex flex-wrap items-center gap-4">
               {/* 4th Fix: Book Demo with a unique WhatsApp message */}
               <a href={bookDemoLink} target="_blank" rel="noreferrer" className="bg-[#EAB308] text-[#0F172A] px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center gap-2">
                 {t.hero.demoBtn}
               </a>
               <a href={whatsappLink} target="_blank" rel="noreferrer" className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center gap-2">
                 <MessageCircle size={20} /> {t.hero.waBtn}
               </a>
               <Link href="/login?mode=demo" className="text-white px-6 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/10 transition-all flex items-center gap-2 mt-4 sm:mt-0">
                 {t.hero.liveDemo}
               </Link>
             </div>
           </div>

           {/* Dashboard Mockup (6th Fix: Data Syncing) */}
           <div className="lg:w-1/2 relative w-full h-[400px] lg:h-[500px]">
              {/* Fake Dashboard */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[#1E293B] rounded-xl border-4 border-gray-800 shadow-2xl flex flex-col overflow-hidden z-10">
                 <div className="h-6 bg-gray-800 flex items-center px-2 gap-1.5 border-b border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
                 <div className="flex-1 bg-white p-4 flex flex-col gap-2 opacity-50">
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="flex gap-2 h-20"><div className="flex-1 bg-blue-50 rounded"></div><div className="flex-1 bg-green-50 rounded"></div></div>
                 </div>
              </div>

              {/* Floating Live Data Cards */}
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

              {/* REAL DATA FROM FIREBASE (6th Fix) */}
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

      {/* 2. FAQs Section (3rd Fix: Now prominently integrated with all questions) */}
      <div className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-6 mb-24">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0F172A] text-center mb-12">{t.faqs.title}</h2>
          <div className="space-y-4">
            {t.faqs.questions.map((faq, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden transition-all shadow-sm">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center text-[#0F172A] font-medium focus:outline-none"
                >
                  <span className={isUrdu ? "text-right w-full block font-bold" : ""}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={20} className="text-gray-400 shrink-0"/> : <ChevronDown size={20} className="text-gray-400 shrink-0"/>}
                </button>
                {openFaq === i && (
                  <div className={`px-6 pb-5 text-gray-500 text-sm leading-relaxed ${isUrdu ? "text-right" : "text-left"}`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-[#0F172A] pt-12 pb-12">
        <footer className="container mx-auto px-6 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
           <div className="flex items-center gap-2 text-white">
            <div className="bg-[#EAB308] p-1 rounded-sm"><ShieldCheck size={16} className="text-[#0F172A]" /></div>
            <span className="text-lg font-bold">EduPilot</span>
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
