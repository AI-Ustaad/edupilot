"use client";
import React, { useState, useEffect } from "react";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(true); 
  const [statusMsg, setStatusMsg] = useState("Checking session...");
  const [error, setError] = useState("");

  useEffect(() => {
    // 🚀 THE FIX: یہ فنکشن یوزر کو پکڑ کر سیدھا اندر لے جائے گا
    const handleSuccessfulLogin = async (user: any) => {
      setStatusMsg("Securing Workspace Session...");
      try {
        const idTokenResult = await user.getIdTokenResult(true);
        const token = idTokenResult.token;

        // سرور پر کوکی (Cookie) بنائیں
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: token }),
        });

        if (!res.ok) throw new Error("Failed to secure session on server");

        setStatusMsg("Routing to Command Centre...");

        // 🚀 Smart Routing
        const claims = idTokenResult.claims || {};
        setTimeout(() => {
          if (claims.tenantId) {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/signup";
          }
        }, 1000);

      } catch (err: any) {
        console.error("Session Error:", err);
        setError("Authentication failed. Please try again.");
        setLoading(false);
        setStatusMsg("");
      }
    };

    // 🔥 THE RADAR: یہ فائر بیس کا ریڈار ہے جو یوزر کو فورا پکڑ لے گا
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // اگر یوزر مل گیا، تو لاگ ان پروسیس شروع کرو!
        handleSuccessfulLogin(user);
      } else {
        // اگر ریڈار میں یوزر نہیں آیا، تو Redirect والا رزلٹ بھی چیک کر لو احتیاطاً
        getRedirectResult(auth).then((result) => {
          if (result?.user) {
            handleSuccessfulLogin(result.user);
          } else {
            // اگر دونوں جگہ یوزر نہیں ہے، تب جا کر بٹن دکھاؤ
            setLoading(false);
            setStatusMsg("");
          }
        }).catch((err) => {
          console.error("Redirect Error:", err);
          setError("Failed to verify Google login.");
          setLoading(false);
          setStatusMsg("");
        });
      }
    });

    // کلین اپ (Cleanup)
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatusMsg("Redirecting to Google...");
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message);
      setLoading(false);
      setStatusMsg("");
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-10 text-center animate-fade-in-up">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm border border-blue-100">
          <GraduationCap size={32} />
        </div>
      </div>

      <h1 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">EduPilot SaaS</h1>
      <p className="text-sm text-slate-500 font-bold mt-2 mb-8">Secure Workspace Login</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 uppercase tracking-widest">
          {error}
        </div>
      )}

      {statusMsg && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100 uppercase tracking-widest flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> {statusMsg}
        </div>
      )}

      {!loading && !statusMsg && (
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12
