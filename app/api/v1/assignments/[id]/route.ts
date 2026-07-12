export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AssignmentService } from "@/services/assignment.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.assignments.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new AssignmentService();
        const id = getIdFromUrl(req);
        const assignment = await service.getAssignmentById(id, tenantId);
        if (!assignment) return createErrorResponse(404, "Assignment not found");
        return createSuccessResponse(assignment);
      })
    )
  )
);
