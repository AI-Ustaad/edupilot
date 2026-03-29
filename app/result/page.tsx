"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { UserPlus, Camera, ShieldCheck, Search, Users, MapPin } from "lucide-react";

export default function EnrollmentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: "", gender: "Male", dob: "", bloodGroup: "",
    bForm: "", religion: "Islam", nationality: "Pakistani",
    fatherName: "", motherName: "", fatherOcc: "", guardianPhone: "",
    admissionNo: "", rollNo: "", class: "", section: "", prevSchool: "",
    currentAddress: "", photoUrl: "" // Placeholder for base64 or storage URL
  });

  // REAL-TIME SYNC: Ensures Attendance and Exams update instantly
  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("admissionNo", "asc"));
    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.admissionNo || !formData.rollNo) {
      return alert("Admission No, Roll No, and Full Name are strictly mandatory!");
    }
    try {
      await addDoc(collection(db, "students"), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      alert("Student Enrolled Successfully!");
      // Reset form
      setFormData({ 
        fullName: "", gender: "Male", dob: "", bloodGroup: "", bForm: "", 
        religion: "Islam", nationality: "Pakistani", fatherName: "", 
        motherName: "", fatherOcc: "", guardianPhone: "", admissionNo: "", 
        rollNo: "", class: "", section: "", prevSchool: "", currentAddress: "", photoUrl: "" 
      });
    } catch (err) {
      console.error("Enrollment Error:", err);
    }
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-[#F8F9FE] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#302B52]">Student Admissions</h1>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3 border border-purple-50">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Search by Admission No..." className="outline-none font-bold text-sm w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        {/* FORM SECTION (3/5 Width) */}
        <div className="xl:col-span-3 bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* PHOTO & BASIC IDENTITY */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 bg-[#F8F9FE] rounded-[32px] border-2 border-dashed border-purple-100 flex flex-col items-center justify-center text-gray-400 hover:text-[#7166F9] cursor-pointer transition-all shrink-0">
                <Camera size={32} />
                <span className="text-[10px] font-black uppercase mt-2">Upload Photo</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-purple-100" />
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
                  <option>Male</option><option>Female</option>
                </select>
                <input type="date" title="DOB" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
                <input type="text" placeholder="B-Form / CNIC *" value={formData.bForm} onChange={e => setFormData({...formData, bForm: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              </div>
            </div>

            {/* FAMILY INFORMATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <div className="md:col-span-2 text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">Family & Contact</div>
              <input type="text" placeholder="Father's Name *" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Mother's Name" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Guardian Phone *" value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Father's Occupation" value={formData.fatherOcc} onChange={e => setFormData({...formData, fatherOcc: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            {/* ACADEMIC PLACEMENT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
              <div className="md:col-span-3 text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">Academic Record</div>
              <input type="text" placeholder="Adm No *" value={formData.admissionNo} onChange={e => setFormData({...formData, admissionNo: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Roll No *" value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
              <input type="text" placeholder="Class/Section" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            <button type="submit" className="w-full bg-[#302B52] text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-[#7166F9] transition-all">
              Complete Enrollment
            </button>
          </form>
        </div>

        {/* RECENTLY ENROLLED (2/5 Width) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[48px] shadow-sm border border-purple-50">
            <h3 className="text-2xl font-black text-[#302B52] mb-6 flex justify-between items-center">
              Enrolled ({students.length}) <Users className="text-[#7166F9] opacity-20" />
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {students.map(s => (
                <div key={s.id} className="p-5 bg-[#F8F9FE] rounded-3xl flex items-center gap-4 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-purple-50">
                  <div className="w-12 h-12 bg-[#302B52] text-white rounded-xl flex items-center justify-center font-black">
                    #{s.rollNo}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-[#302B52] leading-none">{s.fullName}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                      {s.class} | Guardian: {s.guardianPhone}
                    </p>
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
