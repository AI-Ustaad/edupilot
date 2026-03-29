"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { Search, Bell, Users, GraduationCap, UserCheck, CreditCard } from "lucide-react";

export default function Dashboard() {
  const [liveStats, setLiveStats] = useState({
    students: 0,
    staff: 0,
    totalFees: 0,
    topPerformers: [] as any[]
  });

  useEffect(() => {
    // LIVE SYNC: Students
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setLiveStats(prev => ({ ...prev, students: snap.size }));
    });

    // LIVE SYNC: Staff
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
      setLiveStats(prev => ({ ...prev, staff: snap.size }));
    });

    // LIVE SYNC: Total Fee Collection
    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let total = 0;
      snap.forEach(doc => total += Number(doc.data().grandTotal || 0));
      setLiveStats(prev => ({ ...prev, totalFees: total }));
    });

    // LIVE SYNC: Real Top Performers
    const qMarks = query(collection(db, "marks"), orderBy("percentage", "desc"), limit(3));
    const unsubMarks = onSnapshot(qMarks, (snap) => {
      const performers = snap.docs.map(doc => ({
        name: doc.data().studentName,
        score: doc.data().percentage,
        class: doc.data().class
      }));
      setLiveStats(prev => ({ ...prev, topPerformers: performers }));
    });

    return () => { unsubStudents(); unsubStaff(); unsubFees(); unsubMarks(); };
  }, []);

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-black text-[#302B52]">Real-Time Overview</h2>
        <div className="flex gap-6 items-center">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input type="text" placeholder="Search..." className="pl-12 pr-6 py-4 w-80 rounded-2xl bg-white border-none shadow-sm outline-none" />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm"><Bell size={24} className="text-gray-400"/></div>
          <img src="https://ui-avatars.com/api/?name=Admin&background=302B52&color=fff" className="w-14 h-14 rounded-2xl shadow-lg border-4 border-white" />
        </div>
      </header>

      {/* DYNAMIC STATS */}
      <div className="grid grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Students', val: liveStats.students, color: 'border-purple-600', icon: <Users /> },
          { label: 'Staff', val: liveStats.staff, color: 'border-yellow-400', icon: <UserCheck /> },
          { label: 'Attendance', val: '98%', color: 'border-green-400', icon: <GraduationCap /> },
          { label: 'Fee Collection', val: `Rs. ${liveStats.totalFees}`, color: 'border-red-400', icon: <CreditCard /> },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-8 rounded-[40px] shadow-sm border-t-[10px] ${stat.color}`}>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black text-[#302B52]">{stat.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* REAL-TIME BAR CHART PLACEHOLDER */}
        <div className="col-span-2 bg-white p-10 rounded-[48px] shadow-sm">
           <h3 className="text-xl font-black mb-10">Attendance Analytics</h3>
           <div className="flex items-end justify-between h-56 gap-4">
              {[40, 70, 90, 60, 80, 55, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-[#7166F9]/10 rounded-2xl relative group">
                   <div className="absolute bottom-0 w-full bg-[#7166F9] rounded-2xl transition-all" style={{ height: `${h}%` }} />
                </div>
              ))}
           </div>
        </div>

        {/* REAL TOP PERFORMERS */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm">
          <h3 className="text-xl font-black mb-8 text-center">Top Scorers</h3>
          <div className="space-y-4">
            {liveStats.topPerformers.length > 0 ? liveStats.topPerformers.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#F8F9FE] rounded-3xl">
                <div className="w-10 h-10 bg-[#302B52] text-white rounded-xl flex items-center justify-center font-bold">{i+1}</div>
                <div className="flex-1">
                  <p className="font-bold text-[#302B52] text-sm">{p.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{p.class}</p>
                </div>
                <p className="text-[#7166F9] font-black">{p.score}%</p>
              </div>
            )) : <p className="text-center text-gray-300 py-10">No exam data found</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
