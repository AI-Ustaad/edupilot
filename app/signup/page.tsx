"use client";
import React, { useState } from "react";
import { auth, db } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { GraduationCap, LogOut } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // سٹیٹ میں schoolCategory اور governmentType کا اضافہ کیا گیا ہے
  const [formData, setFormData] = useState({ 
    schoolName: "", 
    fullName: "", 
    email: "", 
    password: "",
    schoolCategory: "", 
    governmentType: "" 
  });

  const isGoogleHalfRegistered = user && role === "unregistered";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveUserDataToFirestore = async (uid: string, name: string, email: string) => {
    await setDoc(doc(db, "users", uid), {
      name: name || "Admin",
      email: email,
      role: "admin",
      schoolName: formData.schoolName,
      schoolCategory: formData.schoolCategory, // Government, Private, Madrissa
      governmentType: formData.schoolCategory === "Government" ? formData.governmentType : null,
      createdAt: serverTimestamp()
    });
  };

  const completeGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.schoolCategory) return setError("Please fill all required fields!");
    if (formData.schoolCategory === "Government" && !formData.governmentType) return setError("Please select Government Type!");
    
    setLoading(true);
    try {
      await saveUserDataToFirestore(user!.uid, user!.displayName || "", user!.email || "");
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Failed to register school.");
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.schoolCategory === "Government" && !formData.governmentType) return setError("Please select Government Type!");
    
    setLoading(true);
    setError("");
    try {
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(res.user, { displayName: formData.fullName });
      await saveUserDataToFirestore(res.user.uid, formData.fullName, formData.email);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancelGoogleSession = async () => {
    await logout();
    setFormData({ schoolName: "", fullName: "", email: "", password: "", schoolCategory: "", governmentType: "" });
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 sm:p-10 animate-fade-in-down">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#3ac47d] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3ac47d]/30 mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 text-center">
            {isGoogleHalfRegistered ? "Complete Registration" : "Register Your School"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            {isGoogleHalfRegistered ? `Welcome ${user?.displayName}! Complete your details.` : "Join EduPilot SaaS Platform"}
          </p>
        </div>

        {error && <div className="mb-6 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{error}</div>}

        <form onSubmit={isGoogleHalfRegistered ? completeGoogleRegistration : handleEmailSignup} className="space-y-4">
          
          <input required name="schoolName" value={formData.schoolName} onChange={handleInputChange} type="text" placeholder="School Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
          
          {/* --- SCHOOL CATEGORY DROPDOWN --- */}
          <select required name="schoolCategory" value={formData.schoolCategory} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100 text-slate-700 cursor-pointer">
            <option value="" disabled>Select School Category</option>
            <option value="Government">Government School</option>
            <option value="Private">Private School</option>
            <option value="Madrissa">Madrissa</option>
          </select>

          {/* --- CONDITIONAL: GOVERNMENT TYPE DROPDOWN --- */}
          {formData.schoolCategory === "Government" && (
            <select required name="governmentType" value={formData.governmentType} onChange={handleInputChange} className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-green-100 text-green-800 cursor-pointer animate-fade-in-down">
              <option value="" disabled>Select Government Type</option>
              <option value="Federal">Federal Government</option>
              <option value="Punjab">Punjab Government</option>
            </select>
          )}
          
          {!isGoogleHalfRegistered && (
            <>
              <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Admin Full Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
              <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Admin Email" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
              <input required name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Password (Min 6 chars)" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
            </>
          )}

          <button disabled={loading} type="submit" className="w-full bg-[#3ac47d] hover:bg-[#2eaa6a] text-white py-3.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-70 mt-2">
            {loading ? "Processing..." : (isGoogleHalfRegistered ? "Complete Registration" : "Create Account")}
          </button>
        </form>

        {isGoogleHalfRegistered ? (
          <button onClick={handleCancelGoogleSession} type="button" className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-red-500 font-medium transition-colors">
            <LogOut size={16} /> Not you? Use a different email
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-gray-100"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Or continue with</span>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            <button onClick={handleGoogleSignup} disabled={loading} type="button" className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
          </>
        )}

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Already have a workspace? <Link href="/login" className="text-[#3ac47d] font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
