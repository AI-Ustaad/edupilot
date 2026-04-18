"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, User } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";

// 🚀 FIXED PATH: Going 2 folders back (out of signup, out of app) to reach 'lib'
import { auth } from "../../lib/firebase"; 

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      document.cookie = `session=${userCredential.user.uid}; path=/; max-age=86400; secure`;
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please log in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create account. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#ffffff] flex flex-col justify-center overflow-hidden font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        .techflow-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: #ffffff; overflow: hidden; }
        .techflow-wave {
          position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 120vw; height: 100vh;
          background-image: radial-gradient(ellipse at 80% 20%, rgba(66, 209, 245, 0.45) 0%, transparent 40%),
                            radial-gradient(ellipse at 50% 50%, rgba(255, 230, 109, 0.55) 0%, transparent 40%),
                            radial-gradient(ellipse at 20% 80%, rgba(255, 107, 139, 0.5) 0%, transparent 50%);
          filter: blur(70px); opacity: 0.9;
        }
        .techflow-shadow { box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0,0,0,0.02); }
        .text-super-tight { letter-spacing: -0.04em; }
      `}} />

      <div className="techflow-bg"><div className="techflow-wave"></div></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[440px] px-6 lg:px-0 py-10">
        
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6 hover:scale-105 transition-transform">
            <div className="w-8 h-8 bg-[#0b0b0b] rounded-[6px] flex items-center justify-center shadow-lg">
               <div className="w-3.5 h-3.5 bg-white rounded-[2px] transform rotate-45"></div>
            </div>
            <span className="font-black text-[22px] tracking-tight text-[#0b0b0b]">EduPilot</span>
          </Link>
          <h2 className="text-center text-[2.5rem] font-black text-[#0b0b0b] text-super-tight leading-tight">Create Account</h2>
          <p className="mt-3 text-center text-[16px] text-[#555] font-medium">Register your school and get started today</p>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl py-8 px-6 sm:px-10 border border-white/60 rounded-[20px] techflow-shadow">
          <form className="space-y-5" onSubmit={handleSignup}>
            {error && <div className="bg-red-50 text-red-600 text-[13px] font-bold p-3 rounded-lg border border-red-100 flex items-center justify-center text-center">{error}</div>}

            <div>
              <label className="block text-[14px] font-bold text-[#111] mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#111] text-[15px] font-medium bg-white/50 transition-all shadow-sm" placeholder="Principal Name" />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-[#111] mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#111] text-[15px] font-medium bg-white/50 transition-all shadow-sm" placeholder="admin@school.com" />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-[#111] mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#111] text-[15px] font-medium bg-white/50 transition-all shadow-sm" placeholder="••••••••" minLength={6} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-[10px] shadow-lg text-[15px] font-bold text-white bg-[#0b0b0b] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-70 mt-4">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-[13.5px] text-[#555] font-medium">Already have an account? </span>
            <Link href="/login" className="font-bold text-[#111] hover:text-black text-[13.5px] hover:underline">Sign in</Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100/80">
            <div className="flex justify-center">
               <div className="flex items-center gap-2 text-[#0b0b0b] bg-gray-50/80 px-4 py-2.5 rounded-lg border border-gray-100">
                  <ShieldCheck size={18} className="text-green-500" />
                  <span className="font-bold text-[11px] uppercase tracking-widest text-[#555]">Secure Registration</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
