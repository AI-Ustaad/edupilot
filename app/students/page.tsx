"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { UserPlus, Search, GraduationCap, Calendar, ShieldCheck } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({ fullName: "", fatherName: "", rollNo: "", class: "", section: "" });

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("rollNo", "asc"));
    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.rollNo) return alert("Fill required fields!");
    await addDoc(collection(db, "students"), formData);
    setFormData({ fullName: "", fatherName: "", rollNo: "", class: "", section: "" });
  };

  return (
    <div className="p-10 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-[#302B52]">Student Admissions</h1>
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input type="text" placeholder="Search by roll no..." className="pl-12 pr-6 py-3 rounded-xl bg-white border-none shadow-sm outline-none w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REGISTRATION FORM */}
        <form onSubmit={handleAddStudent} className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-purple-50">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-[#7166F9]"><UserPlus size={20}/> New Enrollment</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl border-none outline-none font-bold text-sm" />
            <input type="text" placeholder="Father Name" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl border-none outline-none font-bold text-sm" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Roll No *" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl border-none outline-none font-bold text-sm" />
              <input type="text" placeholder="Class" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl border-none outline-none font-bold text-sm" />
            </div>
            <button type="submit" className="w-full bg-[#302B52] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#7166F9] transition-all">Register Student</button>
          </div>
        </form>

        {/* ENROLLED LIST */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-purple-50">
          <h3 className="text-xl font-black mb-6">Current Students ({students.length})</h3>
          <div className="space-y-3">
            {students.length > 0 ? students.map(s => (
              <div key={s.id} className="flex items-center justify-between p-5 bg-[#F8F9FE] rounded-3xl hover:bg-purple-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#7166F9] font-black">{s.rollNo}</div>
                  <div>
                    <p className="font-black text-[#302B52]">{s.fullName}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Class: {s.class} | {s.fatherName}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 bg-[#302B52] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">View Profile</button>
              </div>
            )) : <p className="text-center py-20 text-gray-300 font-bold italic">No records found. Add your first student!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
