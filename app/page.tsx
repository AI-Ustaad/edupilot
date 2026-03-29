"use client";
import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Users, ClipboardCheck, CreditCard, BookOpen, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] text-[#302B52] font-sans">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-[#7166F9] p-2 rounded-lg text-white"><GraduationCap size={24} /></div>
          <span className="text-2xl font-bold tracking-tight">EduPilot</span>
        </div>
        <div className="hidden md:flex gap-8 font-semibold text-gray-500">
          <Link href="#features" className="hover:text-[#7166F9]">Features</Link>
          <Link href="#about" className="hover:text-[#7166F9]">Why EduPilot?</Link>
        </div>
        <Link href="/login">
          <button className="bg-[#302B52] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7166F9] transition-all shadow-lg shadow-purple-100">Admin Login</button>
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="px-10 py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-[#7166F9] px-4 py-2 rounded-full text-sm font-bold mb-8">
          <Zap size={16} /> Now with AI-Powered Analytics
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight max-w-5xl">
          Digitize Your School with <span className="text-[#7166F9]">EduPilot</span>
        </h1>
        <p className="text-xl text-gray-500 mb-12 max-w-3xl leading-relaxed">
          The all-in-one platform for modern education. Manage student enrollment, automated attendance, fee collection, and AI-generated report cards in one secure cloud-based portal.
        </p>
        <Link href="/login">
          <button className="bg-[#7166F9] text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 shadow-2xl shadow-purple-200 hover:scale-105 transition-all">
            Get Started Now <ArrowRight size={24} />
          </button>
        </Link>
      </section>

      {/* FEATURES GRID - RESTORING DETAILED INFO */}
      <section id="features" className="px-10 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {[
          { title: "Student Management", desc: "Digital profiles, document storage, and academic history for every student.", icon: <Users/>, color: "bg-purple-50" },
          { title: "Smart Attendance", desc: "Real-time daily tracking with automated SMS alerts to parents for absences.", icon: <ClipboardCheck/>, color: "bg-green-50" },
          { title: "Fee Management", desc: "Track payments, generate invoices, and manage pending dues with one click.", icon: <CreditCard/>, color: "bg-yellow-50" },
          { title: "AI Result Cards", desc: "Automatically calculate grades and generate professional PDF report cards.", icon: <BookOpen/>, color: "bg-blue-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
            <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-[#302B52] group-hover:scale-110 transition-transform`}>{item.icon}</div>
            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
