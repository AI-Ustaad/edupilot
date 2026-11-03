export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";
import { adminAuth } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");
    const idToken = body.idToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined);

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const sessionService = new SessionService();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await sessionService.createCookie(idToken);

    const response = NextResponse.json({ success: true });

    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch (err) {
    logger.error("Session Error:", { metadata: { error: err } });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    let token: string | undefined;
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
        logger.warn("DELETE /session token decode warning:", { metadata: { error: err.message } });
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
    logger.error("Session DELETE Error:", { metadata: { error: err.message } });
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
