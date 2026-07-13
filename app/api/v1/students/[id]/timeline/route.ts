import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AuditRepository } from "@/repositories/audit.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.pathname.split("/").pop();

        if (!studentId) {
          return createErrorResponse(400, "Student ID required");
        }

        const auditRepo = new AuditRepository();
        const allLogs = await auditRepo.findByEntity(tenantId, "student", studentId);
        const studentLogs = allLogs.slice(0, 20);

        return createSuccessResponse(studentLogs);
      })
    )
  )
);
