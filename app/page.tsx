"use client";
import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] flex flex-col items-center justify-center text-[#302B52] p-6">
      <div className="bg-[#7166F9] p-4 rounded-3xl text-white mb-8 shadow-2xl">
        <GraduationCap size={48} />
      </div>
      <h1 className="text-6xl font-black mb-4 text-center">EduPilot</h1>
      <p className="text-xl text-gray-500 mb-12 text-center max-w-md">
        The most advanced AI-powered school management system.
      </p>
      <Link href="/dashboard">
        <button className="bg-[#302B52] text-white px-12 py-5 rounded-2xl font-bold text-xl flex items-center gap-3 shadow-xl hover:bg-[#7166F9] transition-all">
          Enter Dashboard <ArrowRight size={24} />
        </button>
      </Link>
    </div>
  );
}
