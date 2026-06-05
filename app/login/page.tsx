"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Loader2, Chrome } from "lucide-react";
import { useTranslations } from "next-intl";
import { loginWithGoogle } from "@/lib/auth/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // یہاں اپنا لاگ ان لاجک (Firebase auth وغیرہ) کال کریں
    setLoading(false);
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">EduPilot Login</h1>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-6 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center">
          <div className="flex-1 border-t"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border rounded p-2 hover:bg-gray-50 disabled:opacity-50"
        >
          <Chrome className="h-4 w-4" />
          Continue with Google
        </button>

      </div>
    </div>
  );
}
