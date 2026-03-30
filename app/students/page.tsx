"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { UserPlus, Camera, Search, Users, Trash2, ShieldCheck, MapPin, Phone, HeartPulse } from "lucide-react";

export default function EnrollmentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    // BASIC INFO
    fullName: "", gender: "Male", dob: "", bloodGroup: "",
    // IDENTITY
    bForm: "", religion: "Islam", nationality: "Pakistani",
    // FAMILY
    fatherName: "", motherName: "", fatherOcc: "", guardianPhone: "",
    // ACADEMIC (Restored & Fixed)
    admissionNo: "", rollNo: "", class: "1", section: "", 
    prevSchool: "", enrollmentDate: new Date().toISOString().split('T')[0],
    // ADDRESS
    currentAddress: "", permanentAddress: "",
    photoUrl: ""
  });

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("admissionNo", "asc"));
    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // Strict Pakistan CNIC/B-Form Masking
  const handleCNICChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 5) formatted = cleaned.slice(0, 5) + "-" + cleaned.slice(5);
    if (cleaned.length > 12) formatted = formatted.slice(0, 13) + "-" + formatted.slice(13, 14);
    setFormData({ ...formData, bForm: formatted.slice(0, 15) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.bForm.length < 15 || !formData.admissionNo) {
      return alert("Incomplete Data! Ensure CNIC and Admission No are correct.");
    }
    await addDoc(collection(db, "students"), formData);
    alert("Full Professional Enrollment Saved!");
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#302B52]">Full Student Enrollment</h1>
        <div className="bg-white px-6 py-4 rounded-[24px] shadow-xl shadow-purple-100/50 flex items-center gap-3 border border-purple-50">
          <Search size={18} className="text-[#7166F9]" />
          <input type="text" placeholder="Search admission no..." className="outline-none font-bold text-sm w-64 bg-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
        {/* RESTORED ALL-FIELDS FORM */}
        <div className="xl:col-span-3 bg-white/90 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* SECTION 1: IDENTITY & PHOTO */}
            <div className="flex gap-8 items-start">
               <div className="w-32 h-32 bg-[#302B52] rounded-[35px] flex flex-col items-center justify-center text-white shadow-2xl shrink-0">
                  <Camera size={32} />
                  <span className="text-[9px] font-black uppercase mt-2">Photo</span>
               </div>
               <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="col-span-2 text-[10px] font-black text-[#7166F9] uppercase tracking-widest px-2">Basic Identity</div>
                  <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-purple-200" />
                  <input type="text" placeholder="CNIC / B-Form *" value={formData.bForm} onChange={e => handleCNICChange(e.target.value)} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none text-[#7166F9]" />
                  <input type="date" title="DOB" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                    <option>Male</option><option>Female</option>
                  </select>
               </div>
            </div>

            {/* SECTION 2: FAMILY DETAILS */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
              <div className="col-span-2 text-[10px] font-black text-[#7166F9] uppercase tracking-widest px-2">Family & Contact</div>
              <input type="text" placeholder="Father's Name *" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Mother's Name" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Guardian Phone *" value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Father's Occupation" value={formData.fatherOcc} onChange={e => setFormData({...formData, fatherOcc: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            {/* SECTION 3: ACADEMIC (FIXED DROPDOWNS) */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-50">
              <div className="col-span-4 text-[10px] font-black text-[#7166F9] uppercase tracking-widest px-2">School Placement</div>
              <input type="text" placeholder="Adm No *" value={formData.admissionNo} onChange={e => setFormData({...formData, admissionNo: e.target.value})} className="p-4 bg-[#302B52] text-white rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Roll No" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              
              {/* Limited Classes 1-10 */}
              <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>Class {i+1}</option>
                ))}
              </select>

              {/* Custom Section Input */}
              <input type="text" placeholder="Section Name" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none border-b-2 border-[#7166F9]" />
            </div>

            {/* SECTION 4: ADDRESSES & EXTRAS */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
              <textarea placeholder="Current Address" value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none h-24 col-span-2" />
              <input type="text" placeholder="Religion" value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Blood Group" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            <button type="submit" className="w-full bg-[#7166F9] text-white py-6 rounded-[30px] font-black text-xl shadow-2xl hover:bg-[#302B52] transition-all">
              Save Complete Professional Record
            </button>
          </form>
        </div>

        {/* RECENT DIRECTORY */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[50px] shadow-sm border border-purple-50">
            <h3 className="text-2xl font-black text-[#302B52] mb-8">Directory ({students.length})</h3>
            <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2">
              {students.map(s => (
                <div key={s.id} className="p-6 bg-white rounded-[32px] flex items-center justify-between shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#302B52] rounded-2xl flex items-center justify-center font-black text-white">#{s.admissionNo}</div>
                    <div>
                      <p className="font-black text-[#302B52]">{s.fullName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Class {s.class}-{s.section} | {s.guardianPhone}</p>
                    </div>
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
