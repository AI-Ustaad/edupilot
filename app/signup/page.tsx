"use client";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Building2, User, Mail, Lock } from "lucide-react";

export default function SaaSOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    adminName: "",
    email: "",
    password: "",
    plan: "Free Trial"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Generate unique School ID
      const newSchoolId = `SCH-${Date.now()}`;

      // 3. Create School Record
      await setDoc(doc(db, "schools", newSchoolId), {
        name: formData.schoolName,
        plan: formData.plan,
        createdAt: new Date().toISOString(),
        status: "active"
      });

      // 4. Create Admin User Record tied to the School
      await setDoc(doc(db, "users", user.uid), {
        name: formData.adminName,
        email: formData.email,
        role: "admin", // Owner of this specific school
        schoolId: newSchoolId,
        createdAt: new Date().toISOString()
      });

      alert("School Registered Successfully!");
      router.push("/dashboard");

    } catch (error: any) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f4f6] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-4 border-[#3ac47d]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e8f8f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-[#3ac47d]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Register Your School</h1>
          <p className="text-sm text-gray-500 mt-1">Join EduPilot SaaS Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input required type="text" placeholder="School Name" className="w-full bg-gray-50 outline-none rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" onChange={(e) => setFormData({...formData, schoolName: e.target.value})} />
          </div>
          
          <div className="relative">
            <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input required type="text" placeholder="Admin Full Name" className="w-full bg-gray-50 outline-none rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" onChange={(e) => setFormData({...formData, adminName: e.target.value})} />
          </div>

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input required type="email" placeholder="Admin Email" className="w-full bg-gray-50 outline-none rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input required type="password" placeholder="Password (Min 6 chars)" className="w-full bg-gray-50 outline-none rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-[#3ac47d] hover:bg-[#2eaa6a] text-white py-3.5 rounded-xl font-bold shadow-md transition-all mt-4">
            {loading ? "Creating Workspace..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
