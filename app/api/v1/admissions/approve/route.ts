export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { studentId, status } = await req.json();
        if (!studentId || !status) {
          return createErrorResponse(400, "Missing fields: studentId and status required");
        }

        if (!["approved", "rejected"].includes(status)) {
          return createErrorResponse(400, "Status must be 'approved' or 'rejected'");
        }

        const service = new StudentService();

        if (status === "approved") {
          await service.approveAdmission(tenantId, studentId, user.uid);
        } else {
          await service.rejectAdmission(tenantId, studentId, user.uid);
        }

        return createSuccessResponse(null, { message: `Admission ${status} successfully` });
      })
    )
  )
);
