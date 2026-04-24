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

      await fetch("/api/auth/login", {
        method: "POST",
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
      <button onClick={handleLogin}>
        Login with Google
      </button>
    </div>
  );
}
