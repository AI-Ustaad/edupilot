"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          createdAt: new Date(),
          role: "admin"
        });
      }
      
      // 🔥 NOW REDIRECTS TO DASHBOARD
      router.push("/dashboard"); 
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // 🔥 NOW REDIRECTS TO DASHBOARD
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", fontFamily: "sans-serif" }}>
      <div style={{ background: "#1e293b", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <h1 style={{ color: "white", margin: "0 0 5px 0", fontSize: "28px", fontWeight: "900" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 30px 0" }}>Login to your school dashboard.</p>
        
        {error && <p style={{ color: "#ef4444", fontSize: "13px", background: "rgba(239, 68, 68, 0.1)", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>{error}</p>}

        <button onClick={handleGoogleSignIn} disabled={isLoading} style={{ width: "100%", background: "white", color: "#0f172a", padding: "12px", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
          {isLoading ? "Signing In..." : "G Continue with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontSize: "12px", marginBottom: "30px" }}>
          <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
          OR
          <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
        </div>

        <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "transparent", color: "white", outline: "none" }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "transparent", color: "white", outline: "none" }} />
          <button type="submit" disabled={isLoading} style={{ background: "#f59e0b", color: "#0f172a", padding: "12px", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
             {isLoading ? "Please wait..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}