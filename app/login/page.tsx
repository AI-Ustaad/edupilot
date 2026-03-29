"use client";
import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { auth } from "../../lib/firebase"; 
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // This ensures Firebase only runs on the client (the browser)
  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Authentication Error:", error);
    }
  };

  if (!isMounted) return null; // Prevents server-side rendering errors

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center font-sans p-6">
      <div className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl text-center max-w-lg w-full border border-purple-50">
        <div className="bg-[#302B52] w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl">
          <GraduationCap size={40} />
        </div>
        
        <h1 className="text-4xl font-black text-[#302B52] mb-2 tracking-tight">Welcome</h1>
        <p className="text-gray-400 font-bold mb-12 uppercase tracking-widest text-[10px]">EduPilot Admin Gateway</p>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-[#7166F9] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-100 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            className="w-6 h-6 bg-white rounded-full p-1" 
            alt="Google"
          />
          Sign in with Google
        </button>
        
        <div className="mt-12 text-gray-400 text-xs font-medium italic">
          Secure AI-Powered Education Management
        </div>
      </div>
    </div>
  );
}
