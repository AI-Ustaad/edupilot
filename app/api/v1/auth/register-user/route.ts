export const dynamic = 'force-dynamic';
import { withErrorHandler, withRateLimit } from "@/route-helpers";
import { authRateLimit } from "@/lib/ratelimit";
import { AuthService } from "@/services/auth.service";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

const authService = new AuthService();

export const POST = withErrorHandler(
  withRateLimit(authRateLimit)(
    async (req: Request) => {
      const { email, password, name, tenantId } = await req.json();
      const role = "student";

      if (!email || !password || !name) {
        return createErrorResponse(400, "Missing required fields: email, password, name");
      }

      try {
        const { uid, user } = await authService.registerUser(email, password, role, tenantId || null);

        return createSuccessResponse({ uid, user }, { message: "User registered successfully" });
      } catch (error: any) {
        return createErrorResponse(400, error.message);
      }
    }
  )
);
