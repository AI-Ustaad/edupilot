export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { BehaviorService } from "@/services/behavior.service";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.behavior.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const service = new BehaviorService();
        const body = await req.json();
        const result = await service.recordBehavior(body, tenantId, user.uid);
        return createSuccessResponse(result);
      })
    )
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.behavior.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new BehaviorService();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        if (!studentId) return createErrorResponse(400, "Student ID required");

        const logs = await service.getBehaviorLogs(studentId, tenantId);
        return createSuccessResponse(logs);
      })
    )
  )
);
