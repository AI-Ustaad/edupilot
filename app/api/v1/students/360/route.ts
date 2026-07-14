export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        try {
          const { searchParams } = new URL(req.url);
          const studentId = searchParams.get("id");

          if (!studentId) {
            return createErrorResponse(400, "Student ID required");
          }

          const studentService = new StudentService();
          const data = await studentService.student360(tenantId, studentId);

          return createSuccessResponse(data);
        } catch (error: any) {
          logger.error("Student 360 Error:", { metadata: { error } });
          if (error.message === "Student not found") {
            return createErrorResponse(404, "Student not found");
          }
          return createErrorResponse(500, "Internal Server Error");
        }
      })
    )
  )
);
