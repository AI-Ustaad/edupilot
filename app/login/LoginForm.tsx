"use client";

import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setStatus("Opening Google...");

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      setStatus("Securing session...");

      const idToken = await result.user.getIdToken(true);

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Session failed");

      setStatus("Redirecting...");

      // 🔥 CRITICAL FIX
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setLoading(false);
      setStatus("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="px-6 py-3 bg-black text-white rounded-xl"
      >
        {loading ? (
          <span className="flex gap-2 items-center">
            <Loader2 className="animate-spin" size={18} />
            {status}
          </span>
        ) : (
          "Sign in with Google"
        )}
      </button>
    </div>
  );
}
