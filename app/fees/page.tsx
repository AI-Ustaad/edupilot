"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { CreditCard, Printer, Save, Plus } from "lucide-react";

export default function FeeManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [feeCategory, setFeeCategory] = useState("Monthly Fee");
  const [amount, setAmount] = useState(0);
  const [arrears, setArrears] = useState(0);

  useEffect(() => {
    return onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSaveFee = async () => {
    if (!selectedStudent || amount <= 0) return alert("Select student and amount!");
    
    const grandTotal = Number(amount) + Number(arrears);
    
    try {
      await addDoc(collection(db, "fees"), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName,
        category: feeCategory,
        amount: Number(amount),
        arrears: Number(arrears),
        grandTotal: grandTotal,
        date: new Date().toISOString()
      });
      alert("Fee Receipt Saved! Dashboard updated.");
      setAmount(0);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-12">
      <div className="flex gap-8">
        {/* INPUT FORM */}
        <div className="flex-1 bg-white p-10 rounded-[48px] shadow-sm">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><CreditCard className="text-[#7166F9]"/> Generate Receipt</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase">Select Student</label>
              <select onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value))} className="w-full mt-2 p-4 bg-[#F8F9FE] border-none rounded-2xl outline-none font-bold">
                <option>Choose Student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.fullName} - {s.rollNo}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase">Fee Category</label>
                <select onChange={(e) => setFeeCategory(e.target.value)} className="w-full mt-2 p-4 bg-[#F8F9FE] border-none rounded-2xl outline-none font-bold">
                  <option>Monthly Fee</option>
                  <option>Admission Fee</option>
                  <option>Exam Fee</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase">Amount (Rs.)</label>
                <input type="number" onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-2 p-4 bg-[#F8F9FE] border-none rounded-2xl outline-none font-bold" />
              </div>
            </div>

            <button onClick={handleSaveFee} className="w-full bg-[#302B52] text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-all">
              <Save size={20} /> Save & Print Receipt
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW - THEME MATCHED */}
        <div className="w-[450px] bg-white p-8 rounded-[48px] border-4 border-dashed border-[#F8F9FE]">
           <div className="text-center mb-6">
             <h3 className="font-black text-xl text-[#302B52]">Fee Voucher</h3>
             <p className="text-xs text-gray-400">EduPilot Digital Receipt</p>
           </div>
           <div className="space-y-4 text-sm font-bold">
             <div className="flex justify-between border-b pb-2 text-gray-400"><span>Student:</span> <span className="text-[#302B52]">{selectedStudent?.fullName || "---"}</span></div>
             <div className="flex justify-between border-b pb-2 text-gray-400"><span>Category:</span> <span className="text-[#302B52]">{feeCategory}</span></div>
             <div className="flex justify-between pt-4 text-2xl text-[#7166F9] font-black"><span>GRAND TOTAL:</span> <span>Rs. {Number(amount) + Number(arrears)}</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}
