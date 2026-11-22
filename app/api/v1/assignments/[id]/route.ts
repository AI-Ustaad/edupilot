export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AssignmentService } from "@/services/assignment.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.assignments.view)(async (req: Request, context: any) => {
        const tenantId = context?.tenantId;
        const service = new AssignmentService();
        const id = context?.params?.id || getIdFromUrl(req);
        const assignment = await service.getAssignmentById(id, tenantId);
        if (!assignment) return createErrorResponse(404, "Assignment not found");
        return createSuccessResponse(assignment);
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission([PERMISSIONS.assignments.create, PERMISSIONS.assignments.delete, "assignments" as any])(
        async (req: Request, context: any) => {
          const tenantId = context?.tenantId;
          const user = context?.user;
          const id = context?.params?.id || getIdFromUrl(req);
          if (!id) return createErrorResponse(400, "Assignment ID is required");

          const service = new AssignmentService();
          await service.deleteAssignment(id, tenantId, user?.uid || "admin");
          return createSuccessResponse(null, { message: "Assignment deleted successfully" });
        }
      )
    )
  )
);
