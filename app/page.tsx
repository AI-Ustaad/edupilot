"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Users, BookOpen, CreditCard, ClipboardCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] text-[#302B52]">
      {/* NAVIGATION */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-[#7166F9] p-2 rounded-lg text-white">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">EduPilot</span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-gray-600">
          <Link href="/" className="hover:text-[#7166F9]">Home</Link>
          <Link href="#features" className="hover:text-[#7166F9]">Features</Link>
          <Link href="#contact" className="hover:text-[#7166F9]">Contact</Link>
        </div>
        <Link href="/login">
          <button className="bg-[#302B52] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#7166F9] transition-all">
            Login / Register
          </button>
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="px-8 py-20 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Digitize Your School with <span className="text-[#7166F9]">EduPilot</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Pakistan's most advanced AI-powered school management system. Manage students, staff, and fees with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <button className="bg-[#7166F9] text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 shadow-lg shadow-purple-200 hover:scale-105 transition-all">
                Get Started Now <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* MOCKUP PREVIEW */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-16 w-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl border-8 border-white bg-white"
        >
           <div className="bg-[#302B52] h-8 w-full flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
           </div>
           <img src="/dashboard-preview.png" alt="Dashboard Preview" className="w-full h-auto opacity-50" />
           {/* Note: I used a placeholder, you can upload your school.png here later */}
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="px-8 py-20 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Students & Staff", desc: "Complete profile management.", icon: <Users className="text-purple-500" /> },
            { title: "Smart Attendance", desc: "Digital records in seconds.", icon: <ClipboardCheck className="text-green-500" /> },
            { title: "Fees & Budget", desc: "Track collection and dues.", icon: <CreditCard className="text-yellow-500" /> },
            { title: "AI Result Cards", desc: "Automated grade generation.", icon: <BookOpen className="text-blue-500" /> },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-[32px] bg-[#F8F9FE] hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-purple-100 group">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#7166F9] group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
