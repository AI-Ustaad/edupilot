export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        try {
          const url = new URL(req.url);
          // Extract studentId from /students/[id]/timeline
          const segments = url.pathname.split("/");
          const timelineIdx = segments.indexOf("timeline");
          const studentId = timelineIdx > 1 ? segments[timelineIdx - 1] : "";

          if (!studentId) {
            return createErrorResponse(400, "Student ID required");
          }

          const studentService = new StudentService();
          const timeline = await studentService.getTimeline(tenantId, studentId);

          return createSuccessResponse(timeline);
        } catch (error: any) {
          logger.error("Student Timeline Error:", { metadata: { error } });
          return createErrorResponse(500, "Internal Server Error");
        }
      })
    )
  )
);
