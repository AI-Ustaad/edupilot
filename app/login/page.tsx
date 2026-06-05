'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- یہ لائن بلڈ ایرر (DYNAMIC_SERVER_USAGE) کو ختم کرنے کے لیے ضروری ہے ---
export const dynamic = 'force-dynamic';

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
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
