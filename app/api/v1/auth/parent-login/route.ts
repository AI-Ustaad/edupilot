import { NextResponse } from "next/server";
import { buildRequestContext } from "@/route-helpers/request-context";
import { LoginRequestValidator } from "@/lib/auth/auth.validators";
import { AuthService } from "@/services/auth.service";
import { SessionService } from "@/services/session.service";
import { checkAuthRateLimit } from "@/lib/ratelimit";
import { SESSION_EXPIRES_IN_DAYS } from "@/lib/auth/roles.config";
import { logger } from "@/lib/logger/logger";
import { ROLE_CONFIG } from "@/lib/auth/roles.config";

export const runtime = "nodejs";

const authService = new AuthService();
const sessionService = new SessionService();

export async function POST(req: Request) {
  const context = buildRequestContext(req);

  try {
    const { success } = await checkAuthRateLimit();
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json().catch(() => ({}));

    // SECURITY (P0-01): The server MUST NOT accept a raw password. Firebase
    // Admin SDK v13 (firebase-admin@13.10.0) does not expose any
    // server-side password verification API; the only cryptographically
    // secure way to verify an email+password credential is for the client
    // to call Firebase Auth's `signInWithEmailAndPassword` and present the
    // resulting ID token to the server. The server then verifies the
    // token's signature via `adminAuth.verifyIdToken`, which is the
    // Firebase-provided mechanism that cryptographically proves a
    // successful password authentication happened. A request that does
    // not present a valid, verified ID token MUST NOT receive a session
    // cookie or any authentication credential.
    const dto = {
      idToken: typeof body.idToken === "string" ? body.idToken : undefined,
    };

    const validated = LoginRequestValidator.safeParse(dto);
    if (!validated.success) {
      logger.warn("PARENT_LOGIN_INVALID_REQUEST", {
        requestId: context.requestId,
        ip: context.ip,
        reason: "missing_or_invalid_id_token",
      });
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // processLogin calls adminAuth.verifyIdToken internally. A bad /
    // forged / expired token throws InvalidTokenError and is mapped to 401.
    let loginResponse;
    try {
      loginResponse = await authService.processLogin(validated.data.idToken, context);
    } catch (err: any) {
      logger.warn("PARENT_LOGIN_TOKEN_VERIFICATION_FAILED", {
        requestId: context.requestId,
        ip: context.ip,
        errorName: err?.name,
        errorMessage: err?.message,
      });
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const sessionUser = loginResponse.user;

    // The verified token may belong to any role. Parent-login MUST refuse
    // anything that is not a parent. A non-parent successfully
    // authenticated via the standard /api/v1/auth/login route, so this
    // gate is purely about the parent-login surface.
    if (sessionUser.role !== "parent") {
      logger.warn("PARENT_LOGIN_NON_PARENT_BLOCKED", {
        requestId: context.requestId,
        ip: context.ip,
        uid: sessionUser.uid,
        attemptedRole: sessionUser.role,
      });
      return NextResponse.json(
        { success: false, error: "Unauthorized: Parent access only" },
        { status: 403 }
      );
    }

    // Password verification has now been proven by the Firebase ID token.
    // Issue the session cookie and reuse the canonical login response
    // shape so callers can treat the parent-login endpoint identically
    // to the standard login endpoint.
    const sessionCookie = await sessionService.createCookie(validated.data.idToken);

    const response = NextResponse.json({
      success: true,
      message: "Parent authentication successful",
      user: sessionUser,
      redirectTo: ROLE_CONFIG.parent?.redirect || "/parent/dashboard",
    });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * SESSION_EXPIRES_IN_DAYS,
      path: "/",
    });

    return response;
  } catch (error: any) {
    logger.error("PARENT_LOGIN_UNEXPECTED_ERROR", {
      requestId: context.requestId,
      ip: context.ip,
      errorName: error?.name,
      errorMessage: error?.message,
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
