"use client";
import React from "react";
import { Award, ChevronRight, BookOpen } from "lucide-react";

export default function ExamsPage() {
  return (
    <div className="p-10 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-[#302B52]">Exam & Results Portal</h1>
        <div className="bg-[#7166F9] text-white px-6 py-2 rounded-xl font-bold text-sm">Session 2026-27</div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-purple-50">
          <div className="flex items-center gap-4 mb-10">
             <div className="bg-[#302B52] p-3 rounded-2xl text-white shadow-lg"><Award size={28}/></div>
             <div>
               <h3 className="text-xl font-black text-[#302B52]">Assessment Setup</h3>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Step 1: Configure Examination Details</p>
             </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <label className="block">
                <span className="text-xs font-black text-gray-400 uppercase px-4">1. Main Category</span>
                <select className="mt-2 w-full p-5 bg-[#F8F9FE] border-none rounded-2xl font-bold text-[#302B52] outline-none focus:ring-4 focus:ring-purple-100 transition-all">
                  <option>Periodic/Internal Examinations (School-Based)</option>
                  <option>Final Board Examinations</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-black text-gray-400 uppercase px-4">2. Select Exam Type</span>
                <select className="mt-2 w-full p-5 bg-[#F8F9FE] border-none rounded-2xl font-bold text-[#302B52] outline-none">
                  <option>Terminals</option>
                  <option>Monthly Tests</option>
                  <option>Mock Exams</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-black text-gray-400 uppercase px-4">3. Select Term</span>
                <select className="mt-2 w-full p-5 bg-[#F8F9FE] border-none rounded-2xl font-bold text-[#302B52] outline-none">
                  <option>1st Term (Spring)</option>
                  <option>2nd Term (Autumn)</option>
                  <option>Final Term</option>
                </select>
              </label>
            </div>

            <button className="w-full bg-[#7166F9] text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-purple-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mt-6">
              Confirm & Load Student Table <ChevronRight size={24}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
