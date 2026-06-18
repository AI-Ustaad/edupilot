"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true); // By default true to check redirect
  const router = useRouter();

  // 🚀 FIX: Handle Google Redirect Result automatically on page load
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const idToken = await result.user.getIdToken();
          
          // Backend ko Token bheja ja raha hai Cookie banany k liye
          const res = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          
          if (res.ok) {
            router.push("/dashboard");
          } else {
            const data = await res.json();
            setError(data.error || "Google login failed on server");
            setGoogleLoading(false);
          }
        } else {
          // Agar koi redirect na ho to loading false kar do
          setGoogleLoading(false);
        }
      } catch (err: any) {
        console.error("Redirect Error:", err);
        setError("Google login failed. Please try again.");
        setGoogleLoading(false);
      }
    };
    
    checkRedirect();
  }, [router]);

  // ✅ Email/Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Login (Now uses Redirect instead of blocked Popup)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      // 🚀 THE MAGIC FIX: No more popups! It safely redirects.
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      setError("Redirect failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-black text-center">Sign In to EduPilot</h1>
        
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full p-2 border rounded-xl" />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-2 border rounded-xl" />
        </div>
        
        <button type="submit" disabled={loading || googleLoading} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition hover:bg-blue-700">
          {loading && <Loader2 className="animate-spin" size={18} />}
          Sign In
        </button>
        
        <div className="relative flex items-center justify-center">
          <span className="text-gray-400 text-sm font-bold">OR</span>
        </div>
        
        <button type="button" onClick={handleGoogleLogin} disabled={loading || googleLoading}
          className="w-full border border-gray-300 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50">
          {googleLoading ? <Loader2 className="animate-spin text-blue-600" size={18} /> : "🔵"} 
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>
      </form>
    </div>
  );
}
