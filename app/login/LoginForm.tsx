"use client";
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // 1. یوزر گوگل سے لاگ ان ہوتا ہے
      const result = await signInWithPopup(auth, provider);

      // 👉 THE MAGIC: اب ہم صرف ٹوکن نہیں، بلکہ اس کے کلیمز (Claims) بھی منگوائیں گے
      const idTokenResult = await result.user.getIdTokenResult(true); 
      const token = idTokenResult.token;

      // 2. سیشن (Cookies) بنائیں
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      if (response.ok) {
         // 🔥 THE SMART ROUTING (یہاں فیصلہ ہوگا کہ یوزر کہاں جائے گا)
         const claims = idTokenResult.claims;
         
         // اگر یوزر کے پاس tenantId (اسکول) موجود ہے، تو وہ سیدھا ڈیش بورڈ جائے گا
         if (claims.tenantId) {
             router.replace("/dashboard");
         } else {
             // اگر یوزر نیا ہے اور اس کا کوئی اسکول نہیں، تو وہ رجسٹریشن پر جائے گا
             router.replace("/signup");
         }
      } else {
         throw new Error("Failed to create secure session");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <button 
        onClick={handleGoogleLogin} 
        disabled={loading}
        className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-md disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
        {loading ? "Securing connection..." : "Sign in with Google"}
      </button>
    </div>
  );
}
