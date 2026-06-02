import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { adminAuth } from "@/lib/firebase-admin";
import { authRateLimit } from "@/lib/ratelimit";
import { withRateLimit } from "@/route-helpers";

async function loginHandler(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // Create a Firebase session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true, user: { uid: user.uid, email: user.email } });
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Invalid email or password' }, { status: 401 });
  }
}

export const POST = withRateLimit(authRateLimit)(loginHandler);
