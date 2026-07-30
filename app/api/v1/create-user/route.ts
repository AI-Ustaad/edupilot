export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { AuthService } from "@/services/auth.service";
import type { TenantContext } from "@/types/api";

const authService = new AuthService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.users.create)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const { email, password, role } = body;

        if (!email || !password || !role) {
          return createErrorResponse(400, "Email, password, and role are required");
        }

        const allowedRoles = ["admin", "teacher", "accountant", "student", "parent"];
        if (!allowedRoles.includes(role)) {
          return createErrorResponse(400, "Invalid role");
        }

        const { uid, user } = await authService.registerUser(email, password, role, tenantId);

        return createApiResponse(201, { uid, user });
      })
    )
  )
);
