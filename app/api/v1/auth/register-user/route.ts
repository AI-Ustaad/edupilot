export const dynamic = 'force-dynamic';
import { withErrorHandler, withRateLimit } from "@/route-helpers";
import { authRateLimit } from "@/lib/ratelimit";
import { AuthService } from "@/services/auth.service";
import { UserRepository } from "@/repositories/user.repository";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

const authService = new AuthService();
const userRepo = new UserRepository();

export const POST = withErrorHandler(
  withRateLimit(authRateLimit)(
    async (req: Request) => {
      const { email, password, name, tenantId } = await req.json();

      if (!email || !password || !name) {
        return createErrorResponse(400, "Missing required fields: email, password, name");
      }

      try {
        const { uid } = await authService.createUser(email, password, { displayName: name });
        await userRepo.create({
          uid,
          email,
          role: "student",
          tenantId: tenantId || null,
          createdAt: new Date(),
        });

        return createSuccessResponse({ uid }, { message: "User registered successfully" });
      } catch (error: any) {
        return createErrorResponse(400, error.message);
      }
    }
  )
);
