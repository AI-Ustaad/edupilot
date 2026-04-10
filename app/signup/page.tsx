"use client";
import React, { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { user, role } = useAuth(); // AuthContext سے یوزر چیک کریں
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ schoolName: "", fullName: "", email: "", password: "" });

  // اگر بندہ گوگل سے لاگ ان کر چکا ہے لیکن رجسٹرڈ نہیں ہے
  const isGoogleHalfRegistered = user && role === "unregistered";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // گوگل والے یوزر کا سکول رجسٹر کرنے کا فنکشن
  const completeGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName) return setError("Please enter your School Name!");
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user!.uid), {
        name: user!.displayName || "Admin",
        email: user!.email,
        role: "admin", // نیا سکول بنانے والا ہمیشہ ایڈمن ہوگا
        schoolName: formData.schoolName,
        createdAt: serverTimestamp()
      });
      window.location.href = "/dashboard"; // ڈیٹا بیس اپڈیٹ ہونے کے بعد ڈیش بورڈ پر جاؤ
    } catch (err) {
      setError("Failed to register school.");
      setLoading(false);
    }
  };

  // نارمل ای میل سے سائن اپ کرنے کا فنکشن
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(res.user, { displayName: formData.fullName });

      await setDoc(doc(db, "users", res.user.uid), {
        name: formData.fullName,
        email: formData.email,
        role: "admin",
        schoolName: formData.schoolName,
        createdAt: serverTimestamp()
      });
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // گوگل بٹن پر کلک کرنے کا فنکشن
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // جیسے ہی پاپ اپ بند ہوگا، AuthContext خود اسے ہینڈل کر لے گا
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 sm:p-10 animate-fade-in-down">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#3ac47d] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3ac47d]/30 mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {isGoogleHalfRegistered ? "Complete Registration" : "Register Your School"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            {isGoogleHalfRegistered ? `Welcome ${user?.displayName}! Enter school name to continue.` : "Join EduPilot SaaS Platform"}
          </p>
        </div>

        {error && <div className="mb-6 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">{error}</div>}

        <form onSubmit={isGoogleHalfRegistered ? completeGoogleRegistration : handleEmailSignup} className="space-y-4">
          
          <input required name="schoolName" value={formData.schoolName} onChange={handleInputChange} type="text" placeholder="School Name" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-slate-100" />
          
          {/* اگر بندہ گوگل سے نہیں آیا، تو باقی فیلڈز بھی دکھاؤ */}
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

        {/* اگر گوگل سے پہلے ہی آدھا لاگ ان ہے، تو مزید گوگل بٹن نہ دکھاؤ */}
        {!isGoogleHalfRegistered && (
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
