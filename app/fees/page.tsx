"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { CreditCard, Printer, Save } from "lucide-react";

export default function FeesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    // This listener prevents the "Client-side exception" by ensuring data exists
    const unsub = onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    const student = students.find(s => s.id === selectedId);
    if (!student) return alert("Select a student first!");
    await addDoc(collection(db, "fees"), {
      studentName: student.fullName,
      grandTotal: Number(amount),
      date: new Date().toISOString()
    });
    alert("Fee Recorded!");
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black text-[#302B52] mb-10 flex items-center gap-4"><CreditCard size={40} className="text-[#7166F9]"/> Finance Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Student</label>
          <select onChange={(e) => setSelectedId(e.target.value)} className="w-full mt-2 mb-6 p-4 bg-[#F8F9FE] rounded-2xl font-bold outline-none">
            <option value="">Choose Student...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.fullName} - {s.admissionNo}</option>)}
          </select>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount (Rs.)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-2 p-4 bg-[#F8F9FE] rounded-2xl font-bold outline-none mb-8" />
          <button onClick={handleSave} className="w-full bg-[#302B52] text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#7166F9] transition-all">
            <Save size={20} /> Save Fee Receipt
          </button>
        </div>
        <div className="bg-white p-10 rounded-[48px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
           <Printer size={48} className="mb-4 opacity-20" />
           <p className="font-bold italic text-center">Receipt Preview will generate here <br/> upon student selection.</p>
        </div>
      </div>
    </div>
  );
}
