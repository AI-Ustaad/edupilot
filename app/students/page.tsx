"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Bell, Users, UserCheck, CreditCard, GraduationCap } from "lucide-react";

export default function Dashboard() {
  // Fix 1: Initialize at 0 so "7" never appears 
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    fees: 0,
    attendance: "0%" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REAL-TIME SYNC: Students
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setStats(prev => ({ ...prev, students: snap.size }));
      setLoading(false);
    });

    // REAL-TIME SYNC: Staff
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
      setStats(prev => ({ ...prev, staff: snap.size }));
    });

    // REAL-TIME SYNC: Fees
    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let total = 0;
      snap.forEach(doc => total += Number(doc.data().grandTotal || 0));
      setStats(prev => ({ ...prev, fees: total }));
    });

    return () => { unsubStudents(); unsubStaff(); unsubFees(); };
  }, []);

  return (
    <div className="p-10 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-[#302B52]">Real-Time Overview</h1>
        <div className="flex gap-4 items-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50"><Bell size={24} className="text-gray-400"/></div>
          <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl shadow-xl shadow-purple-100/20 border border-purple-50">
            <img src="https://ui-avatars.com/api/?name=Admin&background=302B52&color=fff" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-sm text-[#302B52]">System Admin</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-8">
        {[
          { label: 'Students', val: loading ? "..." : stats.students, color: 'border-purple-600', icon: <Users /> },
          { label: 'Staff', val: stats.staff, color: 'border-yellow-400', icon: <UserCheck /> },
          { label: 'Attendance', val: stats.attendance, color: 'border-green-400', icon: <GraduationCap /> },
          { label: 'Fees Collection', val: `Rs. ${stats.fees}`, color: 'border-red-400', icon: <CreditCard /> },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-10 rounded-[48px] shadow-sm border-t-[12px] ${s.color} hover:scale-105 transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">{s.label}</p>
               <div className="opacity-20">{s.icon}</div>
            </div>
            <h2 className="text-5xl font-black text-[#302B52]">{s.val}</h2>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white/60 backdrop-blur-md p-16 rounded-[60px] shadow-inner h-80 flex flex-col items-center justify-center text-center border-2 border-dashed border-purple-100">
         <GraduationCap size={48} className="text-[#7166F9] opacity-20 mb-4" />
         <p className="text-gray-400 font-bold italic max-w-sm">
           Attendance analytics will visualize here once you mark the daily register in the Attendance section.
         </p>
      </div>
    </div>
  );
}
