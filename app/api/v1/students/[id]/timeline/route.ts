export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
      withPermission(PERMISSIONS.students.view)(
        async (req: Request, { tenantId }: TenantContext) => {
          try {
            const url = new URL(req.url);

            const segments = url.pathname.split("/");
            const timelineIndex = segments.indexOf("timeline");

            const studentId =
              timelineIndex > 0
                ? segments[timelineIndex - 1]
                : "";

            if (!studentId) {
              return createErrorResponse(400, "Student ID required");
            }

            const studentService = new StudentService();

            const timeline = await studentService.getTimeline(
              tenantId,
              studentId
            );

            return createSuccessResponse(timeline);

          } catch (error: any) {

            logger.error("========== TIMELINE ERROR ==========", {
              metadata: {
                error,
                message: error?.message,
                stack: error?.stack,
              },
            });

            console.error("========== TIMELINE ERROR ==========");
            console.error(error);
            console.error(error?.stack);

            return createErrorResponse(
              500,
              error?.message || "Internal Server Error"
            );
          }
        }
      )
    )
  )
);
