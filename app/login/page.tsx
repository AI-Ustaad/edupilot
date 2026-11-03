"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock } from 'lucide-react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { mapAuthError } from '@/lib/auth/auth-client';

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { user, loading: authLoading, refreshUser, setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolveDestination = useCallback((backendRedirect?: string, userProfile?: any) => {
    // If authenticated user lacks tenant or requires onboarding, redirect to onboarding setup
    if (userProfile && (!userProfile.tenantId || userProfile.onboardingRequired || userProfile.role === "guest")) {
      return "/onboarding";
    }
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
      window.location.href = resolveDestination(undefined, user);
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
      if (result.user) {
        setUser(result.user);
      }
      await refreshUser();
      const destination = resolveDestination(result.redirectTo, result.user);
      // Hard navigation ensures HttpOnly session cookie is attached to SSR document request
      window.location.href = destination;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create secure session.');
    }
  }, [refreshUser, resolveDestination, setUser]);

  // Handle Google / Facebook Redirect Result on page mount (for mobile / redirect fallback)
  useEffect(() => {
    let isMounted = true;
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && isMounted) {
          setIsLoading(true);
          const idToken = await result.user.getIdToken(true);
          await createSession(idToken);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(mapAuthError(err));
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

  // Provider 1: Email / Password Login
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError("Please enter both email address and password.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage('Verifying credentials...');

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const idToken = await result.user.getIdToken(true);
      await createSession(idToken);
    } catch (err: any) {
      setError(mapAuthError(err));
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  // Provider 2: Login with Google / Gmail
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('Connecting to Google...');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken(true);
        await createSession(idToken);
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user') {
          setStatusMessage('Redirecting to Google login...');
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    } catch (err: any) {
      setError(mapAuthError(err));
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  // Provider 3: Login with Facebook
  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage('Connecting to Facebook...');

    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');

      try {
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken(true);
        await createSession(idToken);
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user') {
          setStatusMessage('Redirecting to Facebook login...');
          await signInWithRedirect(auth, provider);
          return;
        }
        if (popupErr.code === 'auth/account-exists-with-different-credential') {
          setError(mapAuthError(popupErr));
          setIsLoading(false);
          setStatusMessage(null);
          return;
        }
        throw popupErr;
      }
    } catch (err: any) {
      setError(mapAuthError(err));
      setIsLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 mb-3 shadow-md">
            <span className="text-2xl font-black text-white">E</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">EduPilot SaaS Login</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in with your email or social identity</p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 rounded-xl bg-blue-50 p-3 text-sm text-blue-700 border border-blue-200 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              required
              placeholder="Email address"
              className="block w-full rounded-xl border border-slate-200 py-3 pl-10 text-slate-900 shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm outline-none transition disabled:bg-slate-100"
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
              className="block w-full rounded-xl border border-slate-200 py-3 pl-10 text-slate-900 shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:text-sm outline-none transition disabled:bg-slate-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit"
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-all cursor-pointer"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Signing In...' : 'Sign In with Email'}
          </button>
        </form>

        {/* Social Dividers */}
        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
            <span className="bg-white px-3 text-slate-400">or connect with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
               <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : (
               <GoogleIcon className="h-5 w-5 shrink-0" />
            )}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
               <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : (
               <FacebookIcon className="h-5 w-5 shrink-0" />
            )}
            Continue with Facebook
          </button>
        </div>

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
