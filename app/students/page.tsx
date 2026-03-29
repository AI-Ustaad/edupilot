"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { UserPlus, ShieldCheck, Search } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({ fullName: "", fatherName: "", bForm: "", rollNo: "", class: "", contact: "" });

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("rollNo", "asc"));
    return onSnapshot(q, (snap) => setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.rollNo) return alert("Fill required fields!");
    await addDoc(collection(db, "students"), formData);
    setFormData({ fullName: "", fatherName: "", bForm: "", rollNo: "", class: "", contact: "" });
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-[#F8F9FE]">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#302B52]">Student Admissions</h1>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3 border border-purple-50">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search students..." className="outline-none font-bold text-sm w-48 md:w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50">
          <h3 className="text-xl font-black mb-8 text-[#7166F9] flex items-center gap-2"><UserPlus /> New Enrollment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <input type="text" placeholder="Father's Name" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <input type="text" placeholder="B-Form Number" value={formData.bForm} onChange={e => setFormData({...formData, bForm: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Roll No *" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Class" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>
            <input type="text" placeholder="Guardian Contact" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <button type="submit" className="w-full bg-[#302B52] text-white py-5 rounded-[24px] font-black shadow-xl hover:bg-[#7166F9] transition-all mt-4">Enroll Student</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-purple-50">
          <div className="flex justify-between items-center mb-10 px-2">
            <h3 className="text-2xl font-black text-[#302B52]">Enrolled Students ({students.length})</h3>
            <ShieldCheck className="text-green-400" size={32} />
          </div>
          <div className="space-y-4">
            {students.map(s => (
              <div key={s.id} className="flex items-center justify-between p-6 bg-[#F8F9FE] rounded-[32px] border border-transparent hover:border-purple-100 transition-all">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-[#302B52] text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">{s.rollNo}</div>
                   <div>
                     <p className="font-black text-[#302B52] text-lg">{s.fullName}</p>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Class {s.class} | Father: {s.fatherName}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
