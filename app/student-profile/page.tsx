"use client";
import React, { Suspense } from "react";
import { UserCircle, Book, Calendar, ShieldCheck, CreditCard, Award } from "lucide-react";

function StudentContent() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] p-8 md:p-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - QUICK INFO */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50 text-center">
            <div className="w-32 h-32 bg-[#302B52] rounded-[40px] mx-auto mb-6 flex items-center justify-center text-white shadow-xl">
              <UserCircle size={72} />
            </div>
            <h2 className="text-2xl font-black text-[#302B52]">Student Profile</h2>
            <p className="text-[#7166F9] font-bold text-sm">Class 10 - Section A</p>
            <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div className="bg-[#F8F9FE] p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Attendance</p>
                <p className="font-black text-[#302B52]">98%</p>
              </div>
              <div className="bg-[#F8F9FE] p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Grade</p>
                <p className="font-black text-[#7166F9]">A+</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - DETAILS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50">
            <h3 className="text-xl font-black text-[#302B52] mb-8 flex items-center gap-3">
              <ShieldCheck className="text-[#7166F9]" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { l: 'Registration No', v: 'EP-2024-001', i: <Book/> },
                { l: 'Admission Date', v: 'Jan 10, 2024', i: <Calendar/> },
                { l: 'Fee Status', v: 'Paid', i: <CreditCard/> },
                { l: 'Scholarship', v: 'None', i: <Award/> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-[24px] bg-[#F8F9FE]">
                  <div className="text-gray-300">{item.i}</div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item.l}</p>
                    <p className="font-bold text-[#302B52]">{item.v}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#7166F9] font-bold">Loading Student Profile...</div>}>
      <StudentContent />
    </Suspense>
  );
}
