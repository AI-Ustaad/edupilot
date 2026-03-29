"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Search, Bell, Users, UserCheck, CreditCard, GraduationCap } from "lucide-react";

export default function Dashboard() {
  // We initialize everything to 0 or "0%" so "7" never appears
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    fees: 0,
    attendance: "0%" 
  });

  useEffect(() => {
    // 1. LIVE STUDENT COUNT
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setStats(prev => ({ ...prev, students: snap.size }));
    });

    // 2. LIVE STAFF COUNT
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
      setStats(prev => ({ ...prev, staff: snap.size }));
    });

    // 3. LIVE FEE COLLECTION
    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let total = 0;
      snap.forEach(doc => total += Number(doc.data().grandTotal || 0));
      setStats(prev => ({ ...prev, fees: total }));
    });

    // 4. LIVE ATTENDANCE (Sets to 0% if no records exist)
    const unsubAttend = onSnapshot(collection(db, "attendance"), (snap) => {
      if (snap.empty) {
        setStats(prev => ({ ...prev, attendance: "0%" }));
      } else {
        // You can add logic here to calculate actual avg from your daily logs
        setStats(prev => ({ ...prev, attendance: "Updating..." }));
      }
    });

    return () => { unsubStudents(); unsubStaff(); unsubFees(); unsubAttend(); };
  }, []);

  return (
    <div className="p-10 font-sans">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black text-[#302B52]">Real-Time Overview</h1>
        <div className="flex gap-4 items-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm"><Bell size={24} className="text-gray-400"/></div>
          <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Admin&background=302B52&color=fff" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-sm text-[#302B52]">System Admin</span>
          </div>
        </div>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Students', val: stats.students, color: 'border-purple-600', icon: <Users /> },
          { label: 'Staff', val: stats.staff, color: 'border-yellow-400', icon: <UserCheck /> },
          { label: 'Attendance', val: stats.attendance, color: 'border-green-400', icon: <GraduationCap /> },
          { label: 'Fees Collection', val: `Rs. ${stats.fees}`, color: 'border-red-400', icon: <CreditCard /> },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-8 rounded-[40px] shadow-sm border-t-[10px] ${s.color} hover:scale-105 transition-all`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h2 className="text-4xl font-black text-[#302B52]">{s.val}</h2>
          </div>
        ))}
      </div>
      
      {/* ANALYTICS PLACEHOLDER */}
      <div className="bg-white p-16 rounded-[60px] shadow-sm h-80 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-50">
         <div className="bg-purple-50 p-6 rounded-3xl mb-4">
            <GraduationCap size={48} className="text-[#7166F9] opacity-30" />
         </div>
         <p className="text-gray-300 font-bold italic max-w-sm">
           Attendance analytics will visualize here once you mark the daily register in the Attendance section.
         </p>
      </div>
    </div>
  );
}
