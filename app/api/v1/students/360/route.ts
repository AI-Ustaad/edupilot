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
        let studentId: string | null = null;
        try {
          const { searchParams } = new URL(req.url);
          studentId = searchParams.get("id");

          if (!studentId || !studentId.trim()) {
            return createErrorResponse(400, "Student ID required");
          }

          const studentService = new StudentService();
          const data = await studentService.student360(tenantId, studentId.trim());

          if (!data) {
            return createErrorResponse(404, "Student not found");
          }

          return createSuccessResponse(data);
        } catch (error: any) {
          logger.error("Student 360 Error:", {
            tenantId,
            studentId,
            metadata: {
              errorName: error?.name,
              errorMessage: error?.message,
              errorCode: error?.code,
              errorStack: error?.stack,
              error,
            },
          });
          if (error?.message === "Student not found") {
            return createErrorResponse(404, "Student not found");
          }
          return createErrorResponse(500, "Internal Server Error");
        }
      })
    )
  )
);
