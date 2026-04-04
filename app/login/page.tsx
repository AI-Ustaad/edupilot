"use client";
import React, { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "@/lib/firebase"; 
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setIsChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  if (isChecking) {
    return <div className="h-screen flex items-center justify-center bg-[#f1f4f6] text-[#3ac47d] font-bold">Loading Security...</div>;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#f1f4f6] font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center border-t-4 border-[#3ac47d]">
        
        <div className="flex justify-center mb-6">
          <div className="bg-[#e8f8f0] p-4 rounded-full">
            <ShieldCheck size={40} className="text-[#3ac47d]" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-sm mb-8 font-medium">Secure access to your EduPilot Workspace</p>

        <button
          onClick={handleLogin}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="mt-8 text-xs text-gray-400">EduPilot Enterprise Edition v2.0</p>
      </div>
    </div>
  );
}
