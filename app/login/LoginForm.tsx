"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

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

  // 1. Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await createSecureSession(userCredential.user);
    } catch (err: any) {
      setErrMsg("Invalid email or password.");
      setLoading(false);
    }
  };

  // 2. Google Login (نیا فنکشن)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrMsg("");
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await createSecureSession(userCredential.user);
    } catch (err: any) {
      setErrMsg("Google Sign-In was cancelled or failed.");
      setGoogleLoading(false);
    }
  };

  // 3. API Session Creator (دونوں کے لیے کام کرے گا)
  const createSecureSession = async (user: any) => {
    try {
      const idToken = await user.getIdToken();
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
        setLoading(false);
        setGoogleLoading(false);
      }
    } catch (error) {
      setErrMsg("Session creation failed.");
      setLoading(false);
      setGoogleLoading(false);
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
            disabled={loading || googleLoading} 
            type="submit" 
            className="w-full bg-[#3ac47d] hover:bg-[#2eaa6a] text-white py-3.5 rounded-xl font-bold shadow-md disabled:opacity-70 transition-all"
          >
            {loading ? "Authenticating..." : "Sign In with Email"}
          </button>
        </form>

        {/* --- Divider --- */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-400 font-medium">OR</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* --- Google Sign In Button --- */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          type="button"
          className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3.5 rounded-xl font-bold shadow-sm transition-all disabled:opacity-70"
        >
          {googleLoading ? "Connecting to Google..." : (
            <>
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have a workspace?{" "}
          <Link href="/signup" className="text-[#3ac47d] font-bold hover:underline">
            Register your School
          </Link>
        </div>

      </div>
    </div>
  );
}
