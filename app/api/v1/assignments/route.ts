export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AssignmentService } from "@/services/assignment.service";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.assignments.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new AssignmentService();
        const page = Number(new URL(req.url).searchParams.get("page") || 1);
        const limit = Number(new URL(req.url).searchParams.get("limit") || 50);
        const result = await service.listAssignments(tenantId, page, limit);
        return createSuccessResponse(result, { message: "Assignments fetched successfully" });
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.assignments.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const service = new AssignmentService();
        const body = await req.json();
        const assignment = await service.createAssignment(body, tenantId, user.uid);
        return createApiResponse(201, assignment, "Assignment created successfully");
      })
    )
  )
);
