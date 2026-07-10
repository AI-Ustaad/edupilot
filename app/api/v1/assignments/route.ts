export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AssignmentService } from "@/services/assignment.service";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";

const assignmentService = new AssignmentService();

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.assignments.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const assignments = await assignmentService.listAssignments(tenantId);
      return createSuccessResponse(assignments, { message: "Assignments fetched successfully" });
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.assignments.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const body = await req.json();
      const assignment = await assignmentService.createAssignment(body, tenantId, context.user.uid);
      return createApiResponse(201, assignment, "Assignment created successfully");
    }
  )
);
