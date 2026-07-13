// app/api/v1/students/[id]/comment/route.ts
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.pathname.split("/").pop() || "";

        if (!studentId) {
          return createErrorResponse(400, "Student ID is required");
        }

        const { comment } = await req.json();
        if (!comment) {
          return createErrorResponse(400, "Comment is required");
        }

        const service = new StudentService();
        await service.addComment(tenantId, studentId, comment, user.uid);

        return createSuccessResponse(null, { message: "Comment saved successfully" });
      })
    )
  )
);
