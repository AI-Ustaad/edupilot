export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { MarksService } from "@/services/marks.service";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.marks.manage)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        if (!body.classGrade || !body.section || !body.term) {
          return createErrorResponse(400, "classGrade, section, and term are required");
        }
        const service = new MarksService();
        const result = await service.publishResults(body, tenantId, user.uid);
        return createSuccessResponse(result);
      })
    )
  )
);
