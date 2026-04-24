"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      console.log("LOGIN CLICKED");

      const result = await signInWithPopup(auth, provider);

      console.log("USER:", result.user);

      const idToken = await result.user.getIdToken();

      console.log("TOKEN:", idToken);

      // 👉 بس یہ ایک لائن (headers) کا اضافہ کیا ہے تاکہ بیک اینڈ کو سمجھ آ جائے
      await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      console.log("SESSION CREATED");

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("LOGIN ERROR:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "200px" }}>
      <button 
        onClick={handleLogin}
        style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer", backgroundColor: "#4285F4", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold" }}
      >
        Login with Google
      </button>
    </div>
  );
}
