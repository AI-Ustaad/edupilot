"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      console.log("User:", result.user);

      // 🔥 Redirect after login
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h1 className="text-xl font-bold mb-4">Sign In</h1>

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
