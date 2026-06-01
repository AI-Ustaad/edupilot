// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase'; // آپ کے کلائنٹ SDK سے
import { signInWithEmailAndPassword } from 'firebase/auth';
import { cookies } from 'next/headers';
import { strictRateLimit } from "@/lib/rate-limit";
import { withRateLimit } from "@/route-helpers";

async function loginHandler(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Firebase Authentication سے سائن ان کریں
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // سیشن کوکی بنائیں (آپ کی موجودہ logic)
    const idToken = await user.getIdToken();
    
    // فرض کریں کہ آپ کے پاس سیشن کوکی بنانے کا فنکشن ہے
    // مثال کے طور پر، آپ /api/auth/session کو کال کر سکتے ہیں یا براہِ راست کوکی سیٹ کر سکتے ہیں
    const response = NextResponse.json({ success: true, user: { uid: user.uid, email: user.email } });

    // کوکی میں ID ٹوکن محفوظ کریں (اختیاری)
    response.cookies.set('session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5, // 5 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Invalid email or password' },
      { status: 401 }
    );
  }
}

// لاگ ان پر سخت ریٹ لمٹنگ (15 منٹ میں 10 کوششیں)
export const POST = withRateLimit(strictRateLimit)(loginHandler);
