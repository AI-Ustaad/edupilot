"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { 
  UserPlus, Camera, Briefcase, GraduationCap, 
  Award, History, Trash2, ShieldCheck, Search 
} from "lucide-react";

export default function TeacherManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    // BASIC INFO
    fullName: "", gender: "Male", cnic: "", phone: "", email: "",
    // QUALIFICATIONS
    academicQual: "", professionalQual: "",
    // EXPERIENCE & ROLE
    role: "Teacher", experience: "", salary: "",
    joiningDate: new Date().toISOString().split('T')[0],
    address: "", photoUrl: ""
  });

  useEffect(() => {
    const q = query(collection(db, "staff"), orderBy("fullName", "asc"));
    return onSnapshot(q, (snap) => {
      setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // Professional Pakistan CNIC Masking
  const handleCNICChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 5) formatted = cleaned.slice(0, 5) + "-" + cleaned.slice(5);
    if (cleaned.length > 12) formatted = formatted.slice(0, 13) + "-" + formatted.slice(13, 14);
    setFormData({ ...formData, cnic: formatted.slice(0, 15) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.cnic.length < 15) return alert("Full Name and valid CNIC are required!");
    await addDoc(collection(db, "staff"), formData);
    alert("Professional Staff Record Successfully Created!");
    setFormData({ 
        fullName: "", gender: "Male", cnic: "", phone: "", email: "",
        academicQual: "", professionalQual: "", role: "Teacher", 
        experience: "", salary: "", joiningDate: new Date().toISOString().split('T')[0],
        address: "", photoUrl: "" 
    });
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#302B52]">HR & Faculty Management</h1>
          <p className="text-[#7166F9] font-bold text-xs uppercase tracking-[4px] mt-1">Institutional Workforce Command</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[24px] shadow-xl border border-purple-50 flex items-center gap-3">
          <Search size={18} className="text-[#7166F9]" />
          <input type="text" placeholder="Search staff by name/role..." className="outline-none font-bold text-sm w-64 bg-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
        {/* ENHANCED MULTI-SECTION FORM */}
        <div className="xl:col-span-3 bg-white/90 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* 1. BASIC IDENTITY */}
            <div className="flex gap-8 items-start">
               <div className="w-32 h-32 bg-[#302B52] rounded-[35px] flex flex-col items-center justify-center text-white shadow-2xl shrink-0 cursor-pointer hover:scale-105 transition-transform">
                  <Camera size={32} />
                  <span className="text-[9px] font-black uppercase mt-2">Upload Photo</span>
               </div>
               <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="col-span-2 text-[10px] font-black text-[#7166F9] uppercase tracking-widest px-2">Personal Biodata</div>
                  <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-purple-200" />
                  <input type="text" placeholder="CNIC (XXXXX-XXXXXXX-X) *" value={formData.cnic} onChange={e => handleCNICChange(e.target.value)} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none text-[#7166F9]" />
                  <input type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                    <option>Male</option><option>Female</option>
                  </select>
               </div>
            </div>

            {/* 2. QUALIFICATIONS */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="col-span-2 text-[10px] font-black text-[#7166F9] uppercase tracking-widest px-2 flex items-center gap-2">
                <GraduationCap size={14} /> Qualifications & Expertise
              </div>
              <input type="text" placeholder="Academic Degree (e.g., M.A English)" value={formData.academicQual} onChange={e => setFormData({...formData, academicQual: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Professional Qualification (e.g., B.Ed)" value={formData.professionalQual} onChange={e => setFormData({...formData, professionalQual: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            {/* 3. EXPERIENCE & PAYROLL */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="col-span-3 text-[10px] font-black text-[#7166F9] uppercase tracking-widest px-2 flex items-center gap-2">
                <Briefcase size={14} /> Employment Details
              </div>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                <option>Teacher</option><option>Principal</option><option>Coordinator</option><option>Supporting Staff</option>
              </select>
              <input type="text" placeholder="Years of Experience" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="number" placeholder="Salary (Rs.) *" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="p-4 bg-[#302B52] text-white rounded-2xl font-bold text-sm outline-none shadow-lg" />
            </div>

            <button type="submit" className="w-full bg-[#7166F9] text-white py-6 rounded-[30px] font-black text-xl shadow-2xl hover:bg-[#302B52] transition-all">
              Commit Professional Record
            </button>
          </form>
        </div>

        {/* STAFF DIRECTORY */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-[50px] shadow-sm border border-purple-50">
            <h3 className="text-2xl font-black text-[#302B52] mb-8 flex justify-between items-center">
              Active Faculty ({staff.length}) <ShieldCheck className="text-[#7166F9]" />
            </h3>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {staff.map(member => (
                <div key={member.id} className="p-6 bg-white rounded-[32px] flex items-center justify-between shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F8F9FE] rounded-2xl flex items-center justify-center font-black text-[#7166F9] uppercase">
                      {member.fullName[0]}
                    </div>
                    <div>
                      <p className="font-black text-[#302B52] leading-tight">{member.fullName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{member.role} | Exp: {member.experience} Years</p>
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
