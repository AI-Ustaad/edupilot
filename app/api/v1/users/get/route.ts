export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/auth-server";

export const GET = withErrorHandler(
  withAuth(async () => {
    const user = await getSessionUser();
    if (!user) {
      return createSuccessResponse({ role: "teacher" });
    }
    return createSuccessResponse(user);
  })
);
