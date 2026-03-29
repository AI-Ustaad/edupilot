"use client";
import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Users, ClipboardCheck, CreditCard, BookOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] text-[#302B52] font-sans">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#7166F9] p-2 rounded-lg text-white">
            <GraduationCap size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">EduPilot</span>
        </div>
        <Link href="/login">
          <button className="bg-[#302B52] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7166F9] transition-all">
            Login / Register
          </button>
        </Link>
      </nav>

      {/* HERO */}
      <section className="px-10 py-24 flex flex-col items-center text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
          Digitize Your School <br /> with <span className="text-[#7166F9]">EduPilot</span>
        </h1>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl">
          Pakistan's most advanced AI-powered school management system.
        </p>
        <Link href="/login">
          <button className="bg-[#7166F9] text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 shadow-2xl shadow-purple-200 hover:scale-105 transition-all">
            Get Started Now <ArrowRight size={24} />
          </button>
        </Link>
      </section>

      {/* FEATURES */}
      <section className="px-10 pb-24 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[
          { title: "Students", icon: <Users className="text-purple-500" />, color: "bg-purple-50" },
          { title: "Attendance", icon: <ClipboardCheck className="text-green-500" />, color: "bg-green-50" },
          { title: "Fees", icon: <CreditCard className="text-yellow-500" />, color: "bg-yellow-50" },
          { title: "AI Results", icon: <BookOpen className="text-blue-500" />, color: "bg-blue-50" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-gray-400 text-sm mt-2">Professional management tools for your institution.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
