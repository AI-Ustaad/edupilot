"use client";
import React, { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is already logged in
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
    return <div className="h-screen flex items-center justify-center text-gray-500 font-bold">Checking Authentication...</div>;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md text-center border border-gray-100">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Sign In</h1>
        <p className="text-gray-500 text-sm mb-8">Access your EduPilot Dashboard</p>

        <button
          onClick={handleLogin}
          className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
