"use client";
import React, { Suspense } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";

function StaffContent() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-purple-50">
          <div className="h-48 bg-[#302B52] relative">
            <div className="absolute -bottom-16 left-12 p-2 bg-white rounded-[32px] shadow-xl">
              <div className="w-32 h-32 bg-[#7166F9] rounded-[24px] flex items-center justify-center text-white">
                <User size={64} />
              </div>
            </div>
          </div>
          
          <div className="pt-24 pb-12 px-12">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black text-[#302B52]">Staff Member</h1>
                <p className="text-[#7166F9] font-bold uppercase tracking-widest text-sm mt-1">Senior Instructor</p>
              </div>
              <button className="bg-[#F8F9FE] text-[#302B52] px-6 py-3 rounded-2xl font-bold border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Email Address', val: 'staff@edupilot.com', icon: <Mail size={20}/> },
                { label: 'Phone Number', val: '+92 300 1234567', icon: <Phone size={20}/> },
                { label: 'Department', val: 'Academic Division', icon: <Briefcase size={20}/> },
                { label: 'Join Date', val: 'March 15, 2024', icon: <Calendar size={20}/> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-[#F8F9FE] border border-transparent hover:border-purple-100 transition-all">
                  <div className="text-[#7166F9]">{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-[#302B52] font-bold">{item.val}</p>
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

export default function StaffProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#7166F9] font-bold">Loading Staff Profile...</div>}>
      <StaffContent />
    </Suspense>
  );
}
