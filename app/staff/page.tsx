"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { UserPlus, Briefcase, Phone, BadgeCheck, Trash2 } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({ fullName: "", cnic: "", phone: "", role: "Teacher", salary: "" });

  useEffect(() => {
    const q = query(collection(db, "staff"), orderBy("fullName", "asc"));
    return onSnapshot(q, (snap) => {
      setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.cnic) return alert("Fill required fields!");
    await addDoc(collection(db, "staff"), formData);
    setFormData({ fullName: "", cnic: "", phone: "", role: "Teacher", salary: "" });
  };

  return (
    <div className="p-8 md:p-12 font-sans">
      <h1 className="text-4xl font-black text-[#302B52] mb-10 tracking-tight">Staff & HR Directory</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* REGISTRATION FORM */}
        <div className="lg:col-span-1 bg-white p-10 rounded-[48px] shadow-2xl border border-purple-50">
          <div className="flex items-center gap-3 mb-8 text-[#7166F9]">
            <UserPlus size={24} /> <h3 className="text-xl font-black">Register New Staff</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <input type="text" placeholder="CNIC Number *" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <input type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
              <option>Teacher</option>
              <option>Admin</option>
              <option>Accountant</option>
            </select>
            <input type="number" placeholder="Monthly Salary (Rs.)" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full p-4 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <button type="submit" className="w-full bg-[#302B52] text-white py-5 rounded-[24px] font-black text-lg shadow-xl hover:bg-[#7166F9] transition-all">Save Record</button>
          </form>
        </div>

        {/* STAFF LIST */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-purple-50">
          <h3 className="text-2xl font-black text-[#302B52] mb-8">Active Employees ({staff.length})</h3>
          <div className="space-y-4">
            {staff.map(member => (
              <div key={member.id} className="flex items-center justify-between p-6 bg-[#F8F9FE] rounded-[32px] border border-transparent hover:border-purple-100 transition-all group">
                <div className="flex items-center gap-5">
                   <div className="bg-white p-3 rounded-2xl shadow-sm text-[#7166F9]"><Briefcase size={24}/></div>
                   <div>
                     <p className="font-black text-[#302B52] text-lg">{member.fullName}</p>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{member.role} | {member.phone}</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#7166F9]">Rs. {member.salary}</p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase italic">Paid via Accounts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
