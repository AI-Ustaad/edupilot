"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const [realCount, setRealCount] = useState(0);

  useEffect(() => {
    // REAL-TIME LISTENER: No more fake numbers
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      setRealCount(snap.size); // snap.size is the exact number of documents
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#302B52]">Real-Time Overview</h1>
        <p className="text-gray-400 font-bold">Current institutional status</p>
      </header>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border-t-[10px] border-[#7166F9]">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Students</p>
          <h2 className="text-5xl font-black text-[#302B52]">{realCount}</h2>
        </div>
        {/* ... rest of your stat boxes ... */}
      </div>
      
      {/* ... rest of dashboard ... */}
    </div>
  );
}
