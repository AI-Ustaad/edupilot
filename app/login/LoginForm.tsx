
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  // ✅ Email/Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Step 1: Firebase client سے login کریں
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Step 2: idToken لیں
      const idToken = await userCredential.user.getIdToken();
      // Step 3: Backend کو idToken بھیجیں
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
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
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
        setError(data.error || "Google login failed");
      }
    } catch (err: any) {
      setError("Google login failed. Please try again.");
    } finally {
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
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="animate-spin" size={18} />}
          Sign In
        </button>
        <div className="relative flex items-center justify-center">
          <span className="text-gray-400 text-sm">OR</span>
        </div>
        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
          className="w-full border border-gray-300 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50">
          {googleLoading ? <Loader2 className="animate-spin" size={18} /> : "🔵"} Continue with Google
        </button>
      </form>
    </div>
  );
}
