"use client";

import { useState } from "react";
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
          <GraduationCap size={32} />
        </div>
      </div>

      <h1 className="text-2xl font-black">EDUPILOT SAAS</h1>
      <p className="text-sm text-gray-500 mt-2 mb-8">Secure Login</p>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full border py-4 rounded-xl font-bold flex justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Redirecting...
          </>
        ) : (
          "Sign in with Google"
        )}
      </button>

      <div className="mt-6 text-xs text-green-600 flex justify-center gap-2">
        <ShieldCheck size={14} />
        Secure Access
      </div>
    </div>
  );
}
