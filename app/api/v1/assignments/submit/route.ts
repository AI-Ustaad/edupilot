export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { AssignmentService } from "@/services/assignment.service";
import type { TenantContext } from "@/types/api";

const assignmentService = new AssignmentService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const assignmentId = formData.get("assignmentId") as string;
      const studentId = formData.get("studentId") as string;
      const studentName = formData.get("studentName") as string;

      if (!file || !assignmentId || !studentId) {
        return createErrorResponse(400, "Missing required fields");
      }

      const fileUrl = await assignmentService.uploadSubmissionFile(file, tenantId, assignmentId, studentId);

      const submissionId = await assignmentService.submitAssignment(
        assignmentId,
        studentId,
        studentName || "Unknown",
        fileUrl,
        file.name,
        tenantId,
        user.uid
      );

      return createApiResponse(201, { id: submissionId, fileUrl });
    })
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const assignmentId = searchParams.get("assignmentId");
      if (!assignmentId) {
        return createErrorResponse(400, "assignmentId is required");
      }
      const data = await assignmentService.getSubmissions(assignmentId, tenantId);
      return createSuccessResponse(data);
    })
  )
);
