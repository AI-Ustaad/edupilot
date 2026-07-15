import { NextResponse } from "next/server";
import { buildRequestContext } from "@/route-helpers/request-context";
import { LoginRequestValidator } from "@/lib/auth/auth.validators";
import { AuthService } from "@/services/auth.service";
import { SessionService } from "@/services/session.service";
import { BaseApplicationError } from "@/lib/errors/base.error";
import { SESSION_EXPIRES_IN_DAYS } from "@/lib/auth/roles.config";
import { checkAuthRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger/logger";

export const runtime = "nodejs";

// Instance creation for DI
const authService = new AuthService();
const sessionService = new SessionService();

export async function POST(req: Request) {
  const context = buildRequestContext(req);

  try {
    const { success, reset } = await checkAuthRateLimit();
    if (!success) {
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Try again later.` },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");
    
    const dto = {
      idToken: body.idToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined)
    };

    const validatedRequest = LoginRequestValidator.parse(dto);

    // Orchestration
    const loginResponse = await authService.processLogin(validatedRequest.idToken, context);
    const sessionCookie = await sessionService.createCookie(validatedRequest.idToken);

    // Response & Cookie attachment
    const response = NextResponse.json(loginResponse);
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * SESSION_EXPIRES_IN_DAYS,
      path: "/",
    });

    return response;

  } catch (error: any) {
    logger.error("API_LOGIN_FAILED", {
      requestId: context.requestId, ip: context.ip, userAgent: context.userAgent, route: "/api/v1/auth/login", method: "POST", errorName: error.name, errorMessage: error.message,
    });

    // Global Error Framework catching
    if (error instanceof BaseApplicationError) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.statusCode });
    }

    if (error.errors && error.errors.length > 0) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
