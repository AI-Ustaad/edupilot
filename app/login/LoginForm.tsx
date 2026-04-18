"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase"; 

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // 🚀 گوگل لاگ ان پاپ اپ
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // سرور کو ٹوکن بھیجیں
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Firebase Admin verification failed. Check Vercel Logs.");
      }
    } catch (err: any) {
      console.error("Google Error Details:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Browser blocked the popup. Please allow popups for this site.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in Firebase Console > Settings.");
      } else {
        setError("Google Sign-In failed. Please check your internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Secure session establishment failed.");
      }
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form className="space-y-5" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] font-bold p-3 rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[14px] font-bold text-[#111] mb-1.5">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#111] text-[15px] font-medium bg-white/50 transition-all shadow-sm"
              placeholder="admin@school.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-bold text-[#111] mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#111] text-[15px] font-medium bg-white/50 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-[10px] shadow-lg text-[15px] font-bold text-white bg-[#0b0b0b] hover:bg-black transition-all disabled:opacity-70 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign in to Dashboard"}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-[10px] bg-white hover:bg-gray-50 text-[14px] font-bold text-[#111] transition-all shadow-sm disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : (
          <>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </>
        )}
      </button>
    </div>
  );
}
