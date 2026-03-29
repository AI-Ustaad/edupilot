"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { UserPlus, Search, ShieldCheck, GraduationCap, Trash2 } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: "", fatherName: "", bForm: "", 
    contact: "", rollNo: "", class: "", 
    section: "", prevSchool: "", address: ""
  });

  // REAL-TIME DATA SYNC (Solves the "Fake Data" issue)
  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("rollNo", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.rollNo) return alert("Please fill mandatory fields!");
    try {
      await addDoc(collection(db, "students"), formData);
      setFormData({ fullName: "", fatherName: "", bForm: "", contact: "", rollNo: "", class: "", section: "", prevSchool: "", address: "" });
      alert("Student Enrolled Successfully!");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-[#F8F9FE] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#302B52]">Student Admissions</h1>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3 border border-purple-50">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by name or roll..." className="outline-none font-bold text-sm w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ENROLLMENT FORM (Full Detail Version) */}
        <div className="lg:col-span-1 bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50">
          <div className="flex items-center gap-3 mb-8 text-[#7166F9]">
            <UserPlus size={24} /> <h3 className="text-xl font-black">New Enrollment</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">Basic Info</p>
              <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-purple-100" />
              <input type="text" placeholder="Father's Name" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="B-Form / CNIC" value={formData.bForm} onChange={e => setFormData({...formData, bForm: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">Academic Details</p>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Roll No *" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
                <input type="text" placeholder="Class" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              </div>
              <input type="text" placeholder="Guardian Contact No." value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            <button type="submit" className="w-full bg-[#302B52] text-white py-5 rounded-[24px] font-black text-lg shadow-xl hover:bg-[#7166F9] hover:scale-[1.02] transition-all mt-6">
              Register Student
            </button>
          </form>
        </div>

        {/* STUDENT DIRECTORY */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-purple-50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-[#302B52]">Enrolled Students ({students.length})</h3>
            <ShieldCheck className="text-green-400" size={28} />
          </div>

          <div className="space-y-4">
            {students.length > 0 ? students.map(s => (
              <div key={s.id} className="flex items-center justify-between p-6 bg-[#F8F9FE] rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-purple-100 group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[#302B52] rounded-2xl flex items-center justify-center text-white font-black text-lg">
                    {s.rollNo}
                  </div>
                  <div>
                    <h4 className="font-black text-[#302B52] text-lg">{s.fullName}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Class {s.class} | S/O {s.fatherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white p-3 rounded-xl text-gray-400 hover:text-red-500 cursor-pointer shadow-sm"><Trash2 size={18}/></div>
                  <button className="bg-[#7166F9] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg">View Profile</button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-gray-300 font-bold italic">
                No student records found in your database.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
