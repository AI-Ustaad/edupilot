"use client";
import React, { Suspense } from "react";
import { GraduationCap, ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";

function ResultContent() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] p-8 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl border border-purple-50 overflow-hidden">
        {/* HEADER */}
        <div className="bg-[#302B52] p-10 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl">
              <GraduationCap className="text-[#302B52] w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Student Result Card</h1>
              <p className="opacity-70 text-sm">Academic Session 2025-26</p>
            </div>
          </div>
          <Link href="/dashboard">
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all">
              <ArrowLeft size={20} />
            </button>
          </Link>
        </div>

        {/* RESULT TABLE */}
        <div className="p-10">
          <div className="grid grid-cols-2 gap-8 mb-10 bg-[#F8F9FE] p-6 rounded-3xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Student Name</p>
              <p className="text-lg font-black text-[#302B52]">Searching Student...</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Roll Number</p>
              <p className="text-lg font-black text-[#302B52]">#0000</p>
            </div>
          </div>

          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest">
                <th className="pb-4 px-4">Subject</th>
                <th className="pb-4 px-4">Total</th>
                <th className="pb-4 px-4">Obtained</th>
                <th className="pb-4 px-4 text-right">Grade</th>
              </tr>
            </thead>
            <tbody>
              {['English', 'Mathematics', 'Science', 'Urdu'].map((sub) => (
                <tr key={sub} className="bg-[#F8F9FE] hover:bg-purple-50 transition-all group">
                  <td className="py-4 px-6 rounded-l-2xl font-bold text-[#302B52]">{sub}</td>
                  <td className="py-4 px-6 font-medium text-gray-500">100</td>
                  <td className="py-4 px-6 font-medium text-gray-500">--</td>
                  <td className="py-4 px-6 rounded-r-2xl text-right"><span className="bg-white px-3 py-1 rounded-lg shadow-sm font-bold text-[#7166F9]">A+</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-12 flex gap-4">
            <button className="flex-1 bg-[#7166F9] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-100 hover:scale-[1.02] transition-all">
              <Download size={20} /> Download PDF
            </button>
            <button className="px-8 bg-[#302B52] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <Printer size={20} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#7166F9] font-bold">Loading Result Data...</div>}>
      <ResultContent />
    </Suspense>
  );
}
