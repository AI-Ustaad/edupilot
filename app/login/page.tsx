"use client";
import React, { useEffect, useState } from "react";
import { auth } from "../../lib/firebase"; 
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  if (!mounted) return <div className="bg-[#F8F9FE] min-h-screen" />;

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center">
      <button onClick={handleLogin} className="bg-[#302B52] text-white px-10 py-5 rounded-2xl font-black shadow-xl">
        Continue with Google
      </button>
    </div>
  );
}
