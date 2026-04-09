"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <-- یہ Next.js کا محفوظ لنک ہے
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setErrMsg("Server Error: Check Vercel Variables.");
        await signOut(auth);
      }
    } catch (err) {
      setErrMsg("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f1f4f6] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-4 border-[#3ac47d]">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to EduPilot SaaS</p>
        </div>

        {errMsg && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium mb-4 text-center border border-red-100">
            {errMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-gray-50 outline-none rounded-xl px-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          <input 
            required 
            type="password" 
            placeholder="Password" 
            className="w-full bg-gray-50 outline-none rounded-xl px-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-[#3ac47d] hover:bg-[#2eaa6a] text-white py-3.5 rounded-xl font-bold shadow-md mt-4 disabled:opacity-70 transition-all"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* سائن اپ کا لنک یہاں لگا دیا گیا ہے */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#3ac47d] font-bold hover:underline">
            Register your School
          </Link>
        </div>

      </div>
    </div>
  );
}
