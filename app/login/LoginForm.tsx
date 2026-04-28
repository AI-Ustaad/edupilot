"use client";
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatusMsg("Opening Google Sign-In...");
    setErrorMsg("");
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setStatusMsg("Securing Session...");
      const idToken = await result.user.getIdToken(true);

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include", 
      });

      if (!res.ok) throw new Error("Failed to create secure session");

      setStatusMsg("Redirecting to Dashboard...");
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);

    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setLoading(false);
        setStatusMsg("");
        return;
      }
      
      console.error("Login Error:", err);
      setErrorMsg(err.message || "Login failed. Please try again.");
      setLoading(false);
      setStatusMsg("");
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-10 text-center animate-fade-in-up">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
          <GraduationCap size={32} />
        </div>
      </div>
      <h1 className="text-2xl font-black text-[#0F172A] uppercase">EduPilot SaaS</h1>
      <p className="text-sm text-slate-500 font-bold mt-2 mb-8">Secure Workspace Login</p>
      
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 uppercase tracking-widest">
          {errorMsg}
        </div>
      )}

      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 hover:bg-slate-50 transition-all"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin text-blue-600" /> {statusMsg}</>
        ) : (
          "Sign in with Google"
        )}
      </button>

      <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-2 px-4 rounded-lg inline-flex">
        <ShieldCheck size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Grade Security</span>
      </div>
    </div>
  );
}
