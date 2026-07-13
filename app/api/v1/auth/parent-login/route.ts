import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAuthRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export const runtime = 'nodejs';

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

    const userRecord = await adminAuth.getUserByEmail(email);
    
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== "parent") {
      return createErrorResponse(403, "Unauthorized: Parent access only");
    }

    const customToken = await adminAuth.createCustomToken(userRecord.uid, {
      role: "parent",
      tenantId: userData.tenantId,
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
