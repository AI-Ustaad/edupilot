"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, staff: 0 });

  useEffect(() => {
    // This is the "Live" connection that fixes fake data
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => setStats(prev => ({ ...prev, students: snap.size })));
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => setStats(prev => ({ ...prev, staff: snap.size })));
    return () => { unsubStudents(); unsubStaff(); };
  }, []);

  return (
    <div className="p-10 font-sans">
      <h1 className="text-4xl font-black text-[#302B52] mb-12">Real-Time Overview</h1>
      <div className="grid grid-cols-4 gap-8">
        {[
          { label: 'Students', val: stats.students, color: 'border-purple-600' },
          { label: 'Staff', val: stats.staff, color: 'border-yellow-400' },
          { label: 'Attendance', val: '98%', color: 'border-green-400' },
          { label: 'Fees Collected', val: 'Rs. 0', color: 'border-red-400' },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-10 rounded-[48px] shadow-sm border-t-[12px] ${s.color}`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
            <h2 className="text-5xl font-black text-[#302B52]">{s.val}</h2>
          </div>
        ))}
      </div>
      <div className="mt-12 bg-white p-16 rounded-[60px] shadow-sm h-80 flex items-center justify-center text-gray-300 font-bold italic border-2 border-dashed border-gray-50">
        Attendance analytics will visualize here based on daily register data...
      </div>
    </div>
  );
}
