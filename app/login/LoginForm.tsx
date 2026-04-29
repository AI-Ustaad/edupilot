"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase"; // آپ کا کلائنٹ سائیڈ فائر بیس
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatus("Signing in with Google...");
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      setStatus("Securing Session...");
      
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        setStatus("Redirecting to Dashboard...");
        
        // پکا حل: پہلے ڈیٹا ریفریش کریں پھر ہارڈ ری ڈائریکٹ
        router.refresh(); 
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        throw new Error("Failed to create secure session");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      setStatus("Login Failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {status && <p className="text-sm font-medium text-blue-600">{status}</p>}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="px-6 py-2 bg-white text-black border rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Sign in with Google"}
      </button>
    </div>
  );
}
