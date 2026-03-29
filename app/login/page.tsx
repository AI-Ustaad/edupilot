"use client";
import React from "react";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
// We import auth from your own lib, not directly from firebase here
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl shadow-purple-100 w-full max-w-lg text-center border border-purple-50">
        <div className="bg-[#302B52] w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg">
          <GraduationCap size={40} />
        </div>
        <h1 className="text-4xl font-black text-[#302B52] mb-4">Welcome Back</h1>
        <p className="text-gray-400 font-bold mb-10 uppercase tracking-widest text-xs">EduPilot Admin Portal</p>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-[#7166F9] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 bg-white rounded-full p-1" />
          Continue with Google
        </button>

        <div className="mt-10">
          <Link href="/" className="text-sm font-bold text-[#7166F9] hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
