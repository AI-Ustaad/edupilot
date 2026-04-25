"use client";
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const provider = new GoogleAuthProvider();
      // 1. یوزر گوگل سے لاگ ان کرتا ہے
      const result = await signInWithPopup(auth, provider);

      // 2. فائر بیس سے یوزر کا لیٹسٹ ٹوکن اور کلیمز (Claims) منگوائیں
      const idTokenResult = await result.user.getIdTokenResult(true);
      const token = idTokenResult.token;

      // 3. سرور پر سیشن (Cookies) بنائیں تاکہ API کو پتہ چلے کہ یوزر لاگ ان ہے
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      if (!sessionRes.ok) {
        throw new Error("Failed to create secure session");
      }

      // 🔥 THE MAGIC ROUTING (یہاں فیصلہ ہوگا کہ یوزر کہاں جائے گا)
      const claims = idTokenResult.claims;
      
      if (claims.tenantId && claims.role) {
        // 👉 پرانا یوزر: جس کا اسکول رجسٹرڈ ہے، سیدھا ڈیش بورڈ جائے گا
        router.push("/dashboard");
      } else {
        // 👉 نیا یوزر: جس کا کوئی اسکول نہیں، وہ رجسٹریشن (Signup) پر جائے گا
        router.push("/signup");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      setErrorMsg("Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-10 text-center animate-fade-in-up">
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm border border-blue-100">
            <GraduationCap size={40} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">
          EduPilot SaaS
        </h1>
        <p className="text-sm text-slate-500 font-bold mb-8">
          School Management, Simplified.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
            {errorMsg}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin text-blue-500" /> Authenticating...</>
          ) : (
            <>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase">
          <ShieldCheck size={14} className="text-green-500" />
          Secure Enterprise Login
        </div>

      </div>
    </div>
  );
}
