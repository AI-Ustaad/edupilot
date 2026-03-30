"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { UserPlus, Camera, Search, Users, Edit3, Trash2, ShieldCheck, GraduationCap } from "lucide-react";

export default function EnrollmentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: "", gender: "Male", dob: "", bloodGroup: "",
    bForm: "", religion: "Islam", nationality: "Pakistani",
    fatherName: "", motherName: "", fatherOcc: "", guardianPhone: "",
    admissionNo: "", rollNo: "", class: "10th", section: "Iqbal", 
    prevSchool: "", currentAddress: "", photoUrl: ""
  });

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("admissionNo", "asc"));
    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // AUTOMATIC CNIC MASKING (Pakistan System)
  const handleCNICChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 5) formatted = cleaned.slice(0, 5) + "-" + cleaned.slice(5);
    if (cleaned.length > 12) formatted = formatted.slice(0, 13) + "-" + formatted.slice(13, 14);
    setFormData({ ...formData, bForm: formatted.slice(0, 15) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.bForm.length < 15) {
      return alert("Invalid CNIC or Missing Name!");
    }
    await addDoc(collection(db, "students"), formData);
    alert("Elite Enrollment Complete!");
  };

  const deleteStudent = async (id: string) => {
    if (confirm("Permanently delete this student?")) {
      await deleteDoc(doc(db, "students", id));
    }
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] via-white to-[#F1F0FF] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#302B52]">Student Admissions</h1>
          <p className="text-[#7166F9] font-bold text-xs uppercase tracking-[4px] mt-1">Institutional Enrollment Portal</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[24px] shadow-xl shadow-purple-100/50 flex items-center gap-3 border border-purple-50">
          <Search size={18} className="text-[#7166F9]" />
          <input type="text" placeholder="Search Directory..." className="outline-none font-bold text-sm w-64 bg-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
        {/* FORM SECTION */}
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex gap-8 items-center border-b border-gray-100 pb-8">
               <div className="w-32 h-32 bg-[#302B52] rounded-[35px] flex flex-col items-center justify-center text-white shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                  <Camera size={32} />
                  <span className="text-[9px] font-black uppercase mt-2 tracking-widest">Upload</span>
               </div>
               <div className="grid grid-cols-2 gap-4 flex-1">
                  <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#7166F9]/20" />
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                    <option>Male</option><option>Female</option>
                  </select>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
                  <input type="text" placeholder="CNIC (XXXXX-XXXXXXX-X) *" value={formData.bForm} onChange={e => handleCNICChange(e.target.value)} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none text-[#7166F9]" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <input type="text" placeholder="Father's Name *" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Guardian Phone *" value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            {/* SEPARATED CLASS & SECTION */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <input type="text" placeholder="Adm No *" value={formData.admissionNo} onChange={e => setFormData({...formData, admissionNo: e.target.value})} className="p-4 bg-[#302B52] text-white rounded-2xl font-bold text-sm outline-none shadow-lg" />
              <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                <option>9th</option><option>10th</option><option>11th</option>
              </select>
              <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                <option>Iqbal</option><option>Jinnah</option><option>Sir Syed</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-[#7166F9] text-white py-6 rounded-[30px] font-black text-xl shadow-2xl shadow-purple-200 hover:bg-[#302B52] transition-all">
              Complete Enrollment
            </button>
          </form>
        </div>

        {/* DIRECTORY SECTION WITH EDIT/DELETE */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[50px] shadow-sm border border-purple-50">
            <h3 className="text-2xl font-black text-[#302B52] mb-8 flex justify-between items-center">
              Enrolled ({students.length}) <Users className="text-[#7166F9]" />
            </h3>
            <div className="space-y-4">
              {students.map(s => (
                <div key={s.id} className="p-6 bg-white rounded-[32px] flex items-center justify-between shadow-sm border border-transparent hover:border-[#7166F9]/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F8F9FE] rounded-2xl flex items-center justify-center font-black text-[#7166F9]">#{s.rollNo}</div>
                    <div>
                      <p className="font-black text-[#302B52]">{s.fullName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{s.class}-{s.section} | {s.bForm}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-purple-50 text-[#7166F9] rounded-lg"><Edit3 size={16}/></button>
                    <button onClick={() => deleteStudent(s.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
