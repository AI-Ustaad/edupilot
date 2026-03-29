"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Search, Bell, Users, UserCheck, CreditCard, GraduationCap } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, staff: 0, fees: 0 });

  useEffect(() => {
    // REAL-TIME: Student Count
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setStats(prev => ({ ...prev, students: snap.size }));
    });
    // REAL-TIME: Fee Collection
    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let total = 0;
      snap.forEach(doc => total += Number(doc.data().grandTotal || 0));
      setStats(prev => ({ ...prev, fees: total }));
    });
    return () => { unsubStudents(); unsubFees(); };
  }, []);

  return (
    <div className="p-10">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-[#302B52]">Real-Time Overview</h1>
        <div className="flex gap-4 items-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm"><Bell size={24} className="text-gray-400"/></div>
          <img src="https://ui-avatars.com/api/?name=Admin&background=302B52&color=fff" className="w-14 h-14 rounded-2xl shadow-lg border-4 border-white" />
        </div>
      </header>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Students', val: stats.students, color: 'border-purple-600', icon: <Users /> },
          { label: 'Staff', val: stats.staff, color: 'border-yellow-400', icon: <UserCheck /> },
          { label: 'Attendance', val: '98%', color: 'border-green-400', icon: <GraduationCap /> },
          { label: 'Fees', val: `Rs. ${stats.fees}`, color: 'border-red-400', icon: <CreditCard /> },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-8 rounded-[32px] shadow-sm border-t-[10px] ${s.color}`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h2 className="text-4xl font-black text-[#302B52]">{s.val}</h2>
          </div>
        ))}
      </div>
      
      {/* Analytics Placeholder */}
      <div className="mt-10 bg-white p-12 rounded-[48px] shadow-sm h-80 flex items-center justify-center text-gray-200 font-bold italic">
         Attendance analytics chart will update here based on daily register...
      </div>
    </div>
  );
}
