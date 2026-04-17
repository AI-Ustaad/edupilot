"use client";
import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, ArrowRight, Zap, Users, 
  BarChart3, Clock, Menu, X, MessageCircle,
  CheckCircle2, PlayCircle, HelpCircle
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-[#78d13b]/30">
      
      {/* 🚀 NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#78d13b]" size={36} />
            <span className="font-black text-2xl tracking-tight text-slate-900">EduPilot</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-[#78d13b] transition-colors">Features</Link>
            <Link href="#demo" className="text-sm font-bold text-slate-500 hover:text-[#78d13b] transition-colors">Live Demo</Link>
            <Link href="#faq" className="text-sm font-bold text-slate-500 hover:text-[#78d13b] transition-colors">FAQs</Link>
            <Link href="/login" className="bg-[#0F172A] text-white px-8 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-slate-200">
              Login
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 animate-fade-in-down">
            <Link href="#features" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-600">Features</Link>
            <Link href="#demo" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-600">Live Demo</Link>
            <Link href="#faq" onClick={() => setIsMenuOpen(false)} className="block py-2 font-bold text-slate-600">FAQs</Link>
            <Link href="/login" className="block w-full bg-[#0F172A] text-white text-center py-4 rounded-xl font-black">Login to Portal</Link>
          </div>
        )}
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="pt-40 pb-20 px-4 relative">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#78d13b]/10 border border-[#78d13b]/20 px-4 py-2 rounded-full">
            <Zap size={16} className="text-[#ffc122] fill-[#ffc122]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#78d13b]">Pakistan's #1 AI School System</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Digitalize your School <br />
            <span className="text-[#78d13b]">Without Hassle.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Attendance se lekar auto-result cards tak, sab kuch ek click par. Built for visionary principals in Pakistan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="#demo" className="w-full sm:w-auto bg-[#78d13b] text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[#78d13b]/30">
              Watch Live Demo <PlayCircle size={24} />
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              Sign In Now <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* 🚀 FEATURES SECTION */}
      <section id="features" className="py-24 bg-slate-50/50 px-4">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase">Shandaar Features</h2>
          <div className="w-20 h-1.5 bg-[#ffc122] mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="w-16 h-16 bg-[#78d13b]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#78d13b] transition-colors">
              <Users className="text-[#78d13b] group-hover:text-white" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Smart Attendance</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Staff aur students ki hazri mobile se lagayen aur auto-SMS alerts bhejein.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="w-16 h-16 bg-[#ffc122]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#ffc122] transition-colors">
              <BarChart3 className="text-[#ffc122] group-hover:text-white" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Fast Results</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Marks entry ke saath hi result cards aur analytics dashboard khud-ba-khud tayar.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className="w-16 h-16 bg-[#ff7b60]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#ff7b60] transition-colors">
              <Clock className="text-[#ff7b60] group-hover:text-white" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">Timetable Management</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Teacher leaves aur replacement (Proxy) ko manage karna ab pehle se kahin asaan.</p>
          </div>
        </div>
      </section>

      {/* 🚀 INTERACTIVE DEMO PREVIEW (Mockup) */}
      <section id="demo" className="py-24 px-4">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-3xl border-8 border-slate-800 relative">
          <div className="p-8 md:p-16 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white">Experience the Power of <span className="text-[#78d13b]">EduPilot</span></h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Niche diye gaye interactive previewer mein system ki digital lukk check karein.</p>
            
            {/* Visual Mockup Area */}
            <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-4 md:p-8 backdrop-blur-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                 <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                 <div className="w-3 h-3 bg-green-400 rounded-full"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-50 pointer-events-none">
                 <div className="h-32 bg-white/10 rounded-2xl"></div>
                 <div className="h-32 bg-white/10 rounded-2xl"></div>
                 <div className="h-32 bg-white/10 rounded-2xl"></div>
                 <div className="h-32 bg-white/10 rounded-2xl"></div>
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3">
                   <PlayCircle size={28} className="text-[#78d13b]" />
                   Scoll down for Real Widget Demo
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 FAQ SECTION */}
      <section id="faq" className="py-24 bg-slate-50 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl font-black text-center text-slate-900 uppercase">Sawal-O-Jawab</h2>
          <div className="space-y-4">
            {[
              "Kya ye mobile par chalta hai?",
              "Fees management kahan hai?",
              "Attendance kahan se lagegi?",
              "Support kaise milegi?"
            ].map((q, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center group cursor-pointer hover:border-[#78d13b] transition-all">
                <span className="font-bold text-slate-700">{q}</span>
                <HelpCircle className="text-slate-300 group-hover:text-[#78d13b]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 CONTACT / WHATSAPP CTA */}
      <section className="py-24 px-4 bg-[#0F172A] text-white text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-6xl font-black">Ready to Upgrade?</h2>
          <p className="text-slate-400 text-lg">Abhi register karein aur apne school ko digital banayen.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="https://wa.me/923004134853" target="_blank" className="w-full sm:w-auto bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-[#25D366]/20">
              <MessageCircle size={28} /> WhatsApp Contact
            </a>
            <Link href="/login" className="w-full sm:w-auto border-2 border-white/20 hover:border-white px-10 py-5 rounded-2xl font-black text-lg transition-all">
              Go to Portal
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
