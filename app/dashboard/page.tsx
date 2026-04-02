"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Users, UserCheck, GraduationCap, CreditCard } from "lucide-react";

export default function Dashboard() {
  // STRICT FIX: Initialize at 0 so 7, 8, or 6000 NEVER appear
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    fees: 0,
    attendance: "0%" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REAL-TIME SYNC: This forces the dashboard to show REAL data only
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setStats(prev => ({ ...prev, students: snap.size }));
      setLoading(false); // Only stop loading when real data arrives
    });

    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => {
      setStats(prev => ({ ...prev, staff: snap.size }));
    });

    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let total = 0;
      snap.forEach(doc => total += Number(doc.data().grandTotal || 0));
      setStats(prev => ({ ...prev, fees: total }));
    });

    return () => { unsubStudents(); unsubStaff(); unsubFees(); };
  }, []);

  return (
    <div className="p-10 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <h1 className="text-4xl font-black text-[#302B52] mb-12">Real-Time Overview</h1>

      <div className="grid grid-cols-4 gap-8">
        {[
          { label: 'Students', val: loading ? "..." : stats.students, color: 'border-purple-600', icon: <Users /> },
          { label: 'Staff', val: stats.staff, color: 'border-yellow-400', icon: <UserCheck /> },
          { label: 'Attendance', val: stats.attendance, color: 'border-green-400', icon: <GraduationCap /> },
          { label: 'Fees Collection', val: `Rs. ${stats.fees}`, color: 'border-red-400', icon: <CreditCard /> },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-10 rounded-[48px] shadow-sm border-t-[12px] ${s.color}`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">{s.label}</p>
            <h2 className="text-5xl font-black text-[#302B52]">{s.val}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
