"use client";
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      // 🔥 get token immediately
      const idToken = await result.user.getIdToken(true);

      // 🔐 create session cookie
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        console.error("Session failed");
      }

    } catch (err) {
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGoogleLogin} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : "Sign in with Google"}
    </button>
  );
}
