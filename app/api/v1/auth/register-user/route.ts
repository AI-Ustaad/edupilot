export const dynamic = 'force-dynamic';
import { withErrorHandler, withRateLimit } from "@/route-helpers";
import { authRateLimit } from "@/lib/ratelimit";
import { adminAuth } from "@/lib/firebase-admin";
import { UserRepository } from "@/repositories/user.repository";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export const POST = withErrorHandler(
  withRateLimit(authRateLimit)(
    async (req: Request) => {
      const { email, password, name, tenantId } = await req.json();

      if (!email || !password || !name) {
        return createErrorResponse(400, "Missing required fields: email, password, name");
      }

      try {
        const userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: name,
        });

        const userRepo = new UserRepository();
        await userRepo.create({
          uid: userRecord.uid,
          email,
          role: "student",
          tenantId: tenantId || null,
          createdAt: new Date(),
        });

        return createSuccessResponse({ uid: userRecord.uid }, { message: "User registered successfully" });
      } catch (error: any) {
        return createErrorResponse(400, error.message);
      }
    }
  )
);
