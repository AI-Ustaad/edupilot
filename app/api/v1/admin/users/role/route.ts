export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { AuthService } from "@/services/auth.service";
import type { Role } from "@/types/auth";

const authService = new AuthService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, context: any) => {
        const { tenantId } = context;
        const { uid, role } = await req.json();
        
        if (!uid || !["admin", "teacher", "accountant"].includes(role)) {
          return createErrorResponse(400, "Invalid input");
        }

        await authService.updateUserRole(uid, role as Role, tenantId);

        return createSuccessResponse(null, { message: "Role updated successfully" });
      })
    )
  )
);
