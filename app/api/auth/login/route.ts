import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { strictRateLimit } from "@/lib/rate-limit";
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

    const response = NextResponse.json({ success: true, user: { uid: user.uid, email: user.email } });
    response.cookies.set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Invalid email or password' }, { status: 401 });
  }
}

export const POST = withRateLimit(strictRateLimit)(loginHandler);
