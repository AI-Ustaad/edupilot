import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from "@/lib/firebase-admin";
import { authRateLimit } from "@/lib/ratelimit";
import { withRateLimit } from "@/route-helpers";

async function loginHandler(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID Token required' }, { status: 400 });
    }

    // Verify the token from the client (Google / email‑password)
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create a Firebase session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    });

    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 5, // seconds
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Invalid token' }, { status: 401 });
  }
}

export const POST = withRateLimit(authRateLimit)(loginHandler);
