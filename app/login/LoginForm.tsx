"use client";
import React, { useState } from "react";
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error("Login Error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-10 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
          <GraduationCap size={32} />
        </div>
      </div>
      <h1 className="text-2xl font-black text-[#0F172A] uppercase">EduPilot SaaS</h1>
      <p className="text-sm text-slate-500 font-bold mt-2 mb-8">Secure Workspace Login</p>
      
      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 hover:bg-slate-50"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin text-blue-600" /> Redirecting...</>
        ) : (
          "Sign in with Google"
        )}
      </button>

      <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-2 px-4 rounded-lg inline-flex">
        <ShieldCheck size={16} />
        <span className="text-[10px] font-black uppercase">Enterprise Grade Security</span>
      </div>
    </div>
  );
}
