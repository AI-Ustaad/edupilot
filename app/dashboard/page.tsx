"use client";
import React, { useEffect, useState } from "react";
// Make sure this path points correctly to your firebase config
import { db } from "../../lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  // We initialize with 0 so "7" or "6000" never appear by default
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    fees: 0,
    attendance: "0%" 
  });

  useEffect(() => {
    // Sync live student count
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      setStats(prev => ({ ...prev, students: snap.size }));
    });
    
    // Sync live fees total
    const unsubFees = onSnapshot(collection(db, "fees"), (snap) => {
      let total = 0;
      snap.forEach(doc => {
        total += Number(doc.data().grandTotal || 0);
      });
      setStats(prev => ({ ...prev, fees: total }));
    });

    return () => { unsubStudents(); unsubFees(); };
  }, []);

  return (
    <div className="p-10 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <h1 className="text-4xl font-black text-[#302B52] mb-12">Real-Time Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-white p-10 rounded-[48px] shadow-sm border-t-[12px] border-purple-600">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">Students</p>
          <h2 className="text-5xl font-black text-[#302B52]">{stats.students}</h2>
        </div>
        
        <div className="bg-white p-10 rounded-[48px] shadow-sm border-t-[12px] border-yellow-400">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">Staff</p>
          <h2 className="text-5xl font-black text-[#302B52]">{stats.staff}</h2>
        </div>
        
        <div className="bg-white p-10 rounded-[48px] shadow-sm border-t-[12px] border-green-400">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">Attendance</p>
          <h2 className="text-5xl font-black text-[#302B52]">{stats.attendance}</h2>
        </div>
        
        <div className="bg-white p-10 rounded-[48px] shadow-sm border-t-[12px] border-red-400">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">Fees Collection</p>
          <h2 className="text-5xl font-black text-[#302B52]">Rs. {stats.fees.toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
}
