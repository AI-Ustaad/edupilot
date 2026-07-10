export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { BehaviorService } from "@/services/behavior.service";
import type { TenantContext } from "@/types/api";

const behaviorService = new BehaviorService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const body = await req.json();
      const result = await behaviorService.recordBehavior(body, tenantId, user.uid);
      return createSuccessResponse(result);
    })
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      if (!studentId) return createErrorResponse(400, "Student ID required");

      const logs = await behaviorService.getBehaviorLogs(studentId, tenantId);
      return createSuccessResponse(logs);
    })
  )
);
