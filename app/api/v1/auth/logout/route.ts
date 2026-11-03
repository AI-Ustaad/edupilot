export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export async function POST(req?: NextRequest | Request) {
  try {
    let token: string | undefined;
    if (req) {
      if ("cookies" in req && typeof req.cookies?.get === "function") {
        token = req.cookies.get("session")?.value;
      }
      if (!token && "headers" in req && typeof req.headers?.get === "function") {
        const cookieHeader = req.headers.get("cookie");
        if (cookieHeader) {
          const match = cookieHeader.match(/session=([^;]+)/);
          if (match) token = match[1];
        }
        if (!token) {
          const authHeader = req.headers.get("authorization");
          if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
          }
        }
      }
    }

    if (token) {
      try {
        let uid: string | undefined;
        try {
          const decoded = await adminAuth.verifySessionCookie(token, false);
          uid = decoded.uid;
        } catch {
          const decoded = await adminAuth.verifyIdToken(token, false);
          uid = decoded.uid;
        }
        if (uid) {
          await adminAuth.revokeRefreshTokens(uid);
        }
      } catch (err: any) {
        logger.warn("Logout token decode warning:", { metadata: { error: err.message } });
      }
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err: any) {
    logger.error("Logout error:", { metadata: { error: err.message } });
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }
}
