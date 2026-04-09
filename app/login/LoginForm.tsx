"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function LoginForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      await processUserRedirect(userCredential.user);
    } catch (err: any) {
      setErrMsg("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrMsg("");
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await processUserRedirect(userCredential.user);
    } catch (err: any) {
      setErrMsg("Google Sign-In was cancelled.");
      setGoogleLoading(false);
    }
  };

  const processUserRedirect = async (user: any) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        setErrMsg("Server Error: Check Vercel Variables.");
        await signOut(auth);
        setLoading(false);
        setGoogleLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().schoolId) {
        router.push("/dashboard");
      } else {
        router.push("/signup");
      }
      
      router.refresh();
      
    } catch (error) {
      setErrMsg("Authentication failed.");
      setLoading(false);
      setGoogleLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 overflow-hidden">
      
      {/* --- 1. Animated Background Orbs (جادوئی بیک گراؤنڈ) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#3ac47d]/40 to-emerald-200/20 blur-[80px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-blue-400/30 to-cyan-200/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-[20vw] h-[20vw] rounded-full bg-gradient-to-tr from-purple-300/20 to-pink-200/20 blur-[60px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      {/* --- 2. Login Card (Glassmorphism Effect / شیشے کا ایفیکٹ) --- */}
      <div className="relative z-10 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md border border-white/60">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#3ac47d] to-[#2aa165] shadow-lg shadow-[#3ac47d]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 transform hover:scale-105 transition-transform duration-300">
             <span className="text-3xl text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">EduPilot</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Log in to your workspace</p>
        </div>

        {errMsg && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium mb-5 text-center border border-red-100 animate-fade-in">
            {errMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="group">
            <input 
              required 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-gray-50/50 outline-none rounded-2xl px-5 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-gray-100 transition-all font-medium" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="group">
            <input 
              required 
              type="password" 
              placeholder="Password" 
              className="w-full bg-gray-50/50 outline-none rounded-2xl px-5 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 border border-gray-100 transition-all font-medium" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            disabled={loading || googleLoading} 
            type="submit" 
            className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-900/20 disabled:opacity-70 transition-all active:scale-[0.98] mt-2"
          >
            {loading ? "Authenticating..." : "Sign In with Email"}
          </button>
        </form>

        {/* --- Divider --- */}
        <div className="flex items-center my-7">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-[11px] text-gray-400 font-bold uppercase tracking-widest">Or Continue With</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* --- Google Sign In Button --- */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          type="button"
          className="w-full flex items-center justify-center bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 py-3.5 rounded-2xl font-bold text-gray-700 shadow-sm transition-all disabled:opacity-70 active:scale-[0.98]"
        >
          {googleLoading ? "Connecting..." : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </>
          )}
        </button>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Don't have a workspace?{" "}
          <Link href="/signup" className="text-[#3ac47d] font-bold hover:text-[#2aa165] transition-colors">
            Create School
          </Link>
        </div>

      </div>
    </div>
  );
}
