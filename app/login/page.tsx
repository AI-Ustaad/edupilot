"use client";
import React from "react";
import { GraduationCap } from "lucide-react";
import { auth } from "../../lib/firebase"; 
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center font-sans">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center max-w-md w-full border border-purple-50">
        <div className="bg-[#302B52] w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg">
          <GraduationCap size={40} />
        </div>
        <h1 className="text-4xl font-black text-[#302B52] mb-10">Sign In</h1>
        <button 
          onClick={handleLogin}
          className="w-full bg-[#7166F9] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-100 flex items-center justify-center gap-4 hover:scale-[1.02] transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 bg-white rounded-full p-1" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
