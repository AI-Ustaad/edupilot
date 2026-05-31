import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withRateLimit } from "@/route-helpers";
import { authRateLimit } from "@/lib/ratelimit";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { adminAuth } from "@/lib/firebase-admin";

export const POST = withErrorHandler(
  withRateLimit(authRateLimit)(   // <-- Rate limit (10 req/min)
    withAuth(async (req: Request, context: any) => {
      const { email, password } = await req.json();
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      try {
        // Sign in with Firebase client SDK (for cookie generation)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        // Create session cookie
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ success: true });
        response.cookies.set("session", sessionCookie, {
          maxAge: expiresIn,
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });

        return response;
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    })
  )
);
