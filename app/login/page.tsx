"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase"; // پکا دیسی راستہ
import { ShieldCheck, Mail, Lock } from "lucide-react";

export default function LoginPage() {
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
      // 1. فائر بیس سے لاگ ان کریں
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. مڈل ویئر (Middleware) کے لیے بیک اینڈ سے کوکی بنوائیں
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        // 3. جب کوکی 100% بن جائے، تب ڈیش بورڈ پر جائیں
        router.push("/dashboard");
        router.refresh(); // یہ مڈل ویئر کو فوراً جگا دے گا
      } else {
        setError("Server Error: Please check Vercel Environment Variables.");
        await signOut(auth); // کوکی نہیں بنی تو لاگ آؤٹ کر دو
      }
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f4f6] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-4 border-[#3ac47d]">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e8f8f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-[#3ac47d]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to EduPilot SaaS</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              required 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-gray-50 outline-none rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              required 
              type="password" 
              placeholder="Password" 
              className="w-full bg-gray-50 outline-none rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#3ac47d] border border-transparent" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-[#3ac47d] hover:bg-[#2eaa6a] text-white py-3.5 rounded-xl font-bold shadow-md shadow-green-500/20 transition-all mt-4 disabled:opacity-70 flex justify-center"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}
