"use client";

import { Users, Phone, Mail, MapPin } from "lucide-react";

export default function ParentSnapshot() {
  // Mock Data
  const parent = {
    fatherName: "Muhammad Ali",
    motherName: "Ayesha Ali",
    phone: "+92 300 1234567",
    email: "parent@example.com",
    address: "123 Main St, Lahore",
    emergencyContact: "+92 333 7654321"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Users className="text-indigo-500" /> Parent Snapshot
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Father / Guardian</span>
          <span className="text-sm font-bold text-slate-800">{parent.fatherName}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            <Phone size={14} className="text-slate-500" />
          </div>
          <div>
            <span className="block font-medium text-slate-800">{parent.phone}</span>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Primary</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <Phone size={14} className="text-red-500" />
          </div>
          <div>
            <span className="block font-medium text-red-600">{parent.emergencyContact}</span>
            <span className="block text-[10px] text-red-400 font-bold uppercase">Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
