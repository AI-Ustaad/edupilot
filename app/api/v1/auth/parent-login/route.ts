import { AuthService } from "@/services/auth.service";
import { UserRepository } from "@/repositories/user.repository";
import { checkAuthRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export const runtime = 'nodejs';

const authService = new AuthService();
const userRepo = new UserRepository();

export async function POST(req: Request) {
  try {
    const { success, reset } = await checkAuthRateLimit();
    
    if (!success) {
      const resetTime = new Date(reset).toLocaleTimeString();
      return createErrorResponse(429, `Too many login attempts. Please try again at ${resetTime}.`);
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return createErrorResponse(400, "Email and password are required");
    }

    const userRecord = await authService.getUserByEmail(email);
    
    const sessionUser = await userRepo.findByUidWithFallback(userRecord.uid, email);
    
    if (sessionUser.role !== "parent") {
      return createErrorResponse(403, "Unauthorized: Parent access only");
    }

    const customToken = await authService.createCustomToken(userRecord.uid, {
      role: "parent",
      tenantId: sessionUser.tenantId,
    });

    return createSuccessResponse({ customToken, uid: userRecord.uid });

  } catch (error: any) {
    logger.error("Parent Login API Error:", { metadata: { error } });
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
      return createErrorResponse(401, "Invalid email or password");
    }

    return createErrorResponse(500, "Internal server error");
  }
}
