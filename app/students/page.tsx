"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { UserPlus, ShieldCheck, Search, Contact, School, Users } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: "", gender: "Male", dob: "", bloodGroup: "",
    bForm: "", religion: "Islam", nationality: "Pakistani",
    fatherName: "", motherName: "", fatherOcc: "", guardianPhone: "",
    admissionNo: "", rollNo: "", class: "", section: "", prevSchool: "",
    currentAddress: "", permanentAddress: ""
  });

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("admissionNo", "asc"));
    return onSnapshot(q, (snap) => setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.admissionNo) return alert("Admission No and Name are mandatory!");
    await addDoc(collection(db, "students"), formData);
    alert("Student Successfully Enrolled!");
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-[#F8F9FE]">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#302B52]">Student Admissions</h1>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3 border border-purple-50">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by Admission No..." className="outline-none font-bold text-sm w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        {/* COMPREHENSIVE REGISTRATION FORM (3/5 Width) */}
        <div className="xl:col-span-3 bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50">
          <h3 className="text-2xl font-black mb-8 text-[#7166F9] flex items-center gap-3"><UserPlus /> Complete Enrollment Form</h3>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SECTION 1: BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">Basic & Identity</div>
              <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                <option>Male</option><option>Female</option>
              </select>
              <input type="date" title="Date of Birth" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="B-Form / CNIC Number *" value={formData.bForm} onChange={e => setFormData({...formData, bForm: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            {/* SECTION 2: FAMILY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">Family Information</div>
              <input type="text" placeholder="Father's Name *" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Mother's Name" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Guardian Contact No. *" value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Father's Occupation" value={formData.fatherOcc} onChange={e => setFormData({...formData, fatherOcc: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            {/* SECTION 3: ACADEMIC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">Academic Placement</div>
              <input type="text" placeholder="Admission No *" value={formData.admissionNo} onChange={e => setFormData({...formData, admissionNo: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Class" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Section" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            <textarea placeholder="Current Home Address" value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none h-24" />

            <button type="submit" className="w-full bg-[#302B52] text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-[#7166F9] transition-all">
              Complete Enrollment
            </button>
          </form>
        </div>

        {/* DIRECTORY (2/5 Width) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[48px] shadow-sm border border-purple-50">
            <h3 className="text-2xl font-black text-[#302B52] mb-6 flex justify-between">Enrolled ({students.length}) <ShieldCheck className="text-green-400" /></h3>
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {students.map(s => (
                <div key={s.id} className="p-6 bg-[#F8F9FE] rounded-3xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#302B52] text-white rounded-xl flex items-center justify-center font-black">#{s.admissionNo}</div>
                  <div>
                    <p className="font-black text-[#302B52] leading-none">{s.fullName}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Class {s.class} | Guardian: {s.guardianPhone}</p>
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
