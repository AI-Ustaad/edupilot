export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { HomeworkService } from "@/services/homework.service";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.homework.delete)(async (req: Request, context: any) => {
        const id = context?.params?.id || getIdFromUrl(req);
        if (!id) return createErrorResponse(400, "Homework ID is required");
        const service = new HomeworkService();
        await service.deleteHomework(id, context.tenantId, context.user?.uid);
        return createSuccessResponse(null, { message: "Homework deleted successfully" });
      })
    )
  )
);
