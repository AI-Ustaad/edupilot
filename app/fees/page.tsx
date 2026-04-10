"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, query, orderBy } from "firebase/firestore";
import { CreditCard, Save, Printer, User, Search, Wallet } from "lucide-react";

export default function FinancePortal() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Monthly Fee");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REAL-TIME SYNC: Pulling from the same "students" collection
    const q = query(collection(db, "students"), orderBy("fullName", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSaveFee = async () => {
    const student = students.find(s => s.id === selectedId);
    if (!student || !amount) return alert("Please select a student and enter amount!");

    try {
      await addDoc(collection(db, "fees"), {
        studentId: selectedId,
        studentName: student.fullName,
        admissionNo: student.admissionNo,
        amount: Number(amount),
        category: category,
        date: new Date().toISOString(),
        grandTotal: Number(amount) // For Dashboard sync
      });
      alert("Fee Receipt Saved Successfully!");
      setAmount("");
    } catch (err) {
      console.error("Finance Error:", err);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedId);

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#302B52]">Finance Portal</h1>
          <p className="text-[#7166F9] font-bold text-xs uppercase tracking-[4px] mt-1">Fee & Accounts Management</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[24px] shadow-xl shadow-purple-100/20 border border-purple-50 flex items-center gap-3">
          <Wallet className="text-[#7166F9]" />
          <span className="font-black text-[#302B52]">School Ledger</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* RECEIPT GENERATOR */}
        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white">
          <div className="flex items-center gap-3 mb-8 text-[#7166F9]">
            <CreditCard size={24} /> <h3 className="text-xl font-black">Generate Fee Receipt</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Select Student</label>
              <select 
                value={selectedId} 
                onChange={(e) => setSelectedId(e.target.value)} 
                className="w-full mt-2 p-5 bg-[#F8F9FE] rounded-2xl font-bold text-[#302B52] outline-none border-2 border-transparent focus:border-purple-200 transition-all"
              >
                <option value="">Choose Student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {/* FIXED: Using explicit fields to avoid blank dashes */}
                    {s.fullName ? `${s.fullName} (${s.admissionNo || 'No Adm#'})` : "Unnamed Student"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Fee Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-2 p-5 bg-[#F8F9FE] rounded-2xl font-bold text-[#302B52] outline-none"
                >
                  <option>Monthly Fee</option>
                  <option>Admission Fee</option>
                  <option>Exam Fee</option>
                  <option>Fine/Surcharge</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Amount (Rs.)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-2 p-5 bg-[#F8F9FE] rounded-2xl font-bold text-[#302B52] outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveFee}
              className="w-full bg-[#302B52] text-white py-6 rounded-[30px] font-black text-xl shadow-2xl hover:bg-[#7166F9] transition-all flex items-center justify-center gap-3"
            >
              <Save size={24} /> Save Fee Receipt
            </button>
          </div>
        </div>

        {/* LIVE RECEIPT PREVIEW */}
        <div className="bg-white/60 backdrop-blur-md p-10 rounded-[50px] border-4 border-dashed border-purple-100 flex flex-col items-center justify-center text-center">
          {selectedStudent ? (
            <div className="w-full space-y-6">
              <div className="bg-[#302B52] text-white p-6 rounded-3xl shadow-xl">
                <Printer size={32} className="mx-auto mb-2 opacity-50" />
                <h4 className="font-black uppercase tracking-[5px]">Fee Voucher</h4>
              </div>
              <div className="space-y-4 font-bold text-[#302B52] text-left px-4">
                <div className="flex justify-between border-b pb-2 border-purple-100">
                  <span className="text-gray-400 text-xs uppercase">Student Name:</span>
                  <span>{selectedStudent.fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-purple-100">
                  <span className="text-gray-400 text-xs uppercase">Category:</span>
                  <span>{category}</span>
                </div>
                <div className="flex justify-between pt-4">
                  <span className="text-xl font-black">GRAND TOTAL:</span>
                  <span className="text-3xl font-black text-[#7166F9]">Rs. {amount || "0"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="opacity-20 flex flex-col items-center">
              <Printer size={64} className="mb-4" />
              <p className="font-black italic">Select a student to generate <br/> receipt preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
