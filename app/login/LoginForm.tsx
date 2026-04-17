"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Ensure your firebase auth is exported from here

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Set Session Cookie for your middleware.ts
      // We store the UID in the session to authorize the user
      document.cookie = `session=${userCredential.user.uid}; path=/; max-age=86400; secure`;

      // 3. Redirect to Dashboard
      router.push("/dashboard");
      
    } catch (err: any) {
      console.error("Login Error:", err);
      // Clean error messages for the user
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to connect to the server. Check your internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleLogin}>
      {error && (
        <div className="bg-red-50 text-red-600 text-[13px] font-bold p-3 rounded-lg border border-red-100 flex items-center justify-center">
          {error}
        </div>
      )}

      <div>
        <label className="block text-[13px] font-bold text-[#111] mb-1.5">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111] focus:border-transparent text-[14px] font-medium bg-white/50 transition-all shadow-sm"
            placeholder="admin@school.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#111] mb-1.5">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111] focus:border-transparent text-[14px] font-medium bg-white/50 transition-all shadow-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-[#111] focus:ring-[#111] border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-[13px] text-[#555] font-medium cursor-pointer">
            Remember me
          </label>
        </div>
        <a href="#" className="font-bold text-[#111] hover:underline text-[13px]">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-[14px] font-bold text-white bg-[#111] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-70 mt-2"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign in to Dashboard"}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}
