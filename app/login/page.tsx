"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Chrome, Mail, Lock } from 'lucide-react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolveDestination = useCallback((backendRedirect?: string) => {
    if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('/login')) {
      return redirectParam;
    }
    if (backendRedirect && backendRedirect !== '/login') {
      return backendRedirect;
    }
    return '/dashboard';
  }, [redirectParam]);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = resolveDestination();
    }
  }, [user, authLoading, resolveDestination]);

  const createSession = useCallback(async (idToken: string) => {
    setStatusMessage('Creating session and redirecting...');
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }), 
    });

    if (response.ok) {
      const result = await response.json();
      await refreshUser();
      const destination = resolveDestination(result.redirectTo);
      // Hard navigation ensures HttpOnly cookie is attached to SSR document request
      window.location.href = destination;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create secure session.');
    }
  }, [refreshUser, resolveDestination]);

  // Handle Google Redirect Result on page mount (fallback for mobile/popup-blocked browsers)
  useEffect(() => {
    let isMounted = true;
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && isMounted) {
          setIsLoading(true);
          const idToken = await result.user.getIdToken();
          await createSession(idToken);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Google sign-in failed. Please try again.');
          setIsLoading(false);
          setStatusMessage(null);
        }
      }
    };
    checkRedirect();
    return () => {
      isMounted = false;
    };
  }, [createSession]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('Connecting to Google...');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        await createSession(idToken);
      } catch (popupErr: any) {
        // Fallback to redirect if popup was blocked by browser
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user') {
          setStatusMessage('Redirecting to Google login...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatusMessage('Verifying credentials...');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      await createSession(idToken);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed.');
      }
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100">
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 mb-4 shadow-md">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">EduPilot Login</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to your account to continue</p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 rounded-md bg-blue-50 p-3 text-sm text-blue-700 border border-blue-200 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              required
              placeholder="Email address"
              className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="password"
              required
              placeholder="Password"
              className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit"
            className="flex w-full justify-center items-center gap-2 rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-70 transition-all cursor-pointer"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm font-medium">
            <span className="bg-white px-4 text-slate-400">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isLoading ? (
             <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          ) : (
             <Chrome className="h-5 w-5 text-blue-600" />
          )}
          Continue with Google
        </button>

      </div>
    </div>
  );
}

export default function EnterpriseLogin() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
