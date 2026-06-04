import { withErrorHandler, withLogging, withRateLimit } from "@/route-helpers";
import { adminAuth } from "@/lib/firebase-admin";
import { authRateLimit } from "@/lib/ratelimit";
import { NextResponse } from "next/server"; // یہ امپورٹ شامل کریں

export const POST = withErrorHandler(
  withLogging(
    withRateLimit(authRateLimit)(
      async (req: Request) => {
        const { idToken } = await req.json();

        if (!idToken) {
          throw new Error("ID Token required");
        }

        // Verify the token from the client
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Create a Firebase session cookie (5 days)
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        // یہاں ہم نے createApiResponse کی جگہ NextResponse.json استعمال کیا ہے
        const response = NextResponse.json({
          success: true,
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email,
          },
        }, { status: 200 });

        // اب .cookies پراپرٹی یہاں کام کرے گی
        response.cookies.set('session', sessionCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 5,
        });

        return response;
      }
    )
  )
);
