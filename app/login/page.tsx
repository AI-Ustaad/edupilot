"use client";

import { getAuth, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LoginPage() {
  const handleLogin = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    await signInWithRedirect(auth, provider);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Login with Google
      </button>
    </div>
  );
}
