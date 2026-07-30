export const dynamic = 'force-dynamic';
// app/api/v1/homework/route.ts
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { HomeworkService } from "@/services/homework.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.homework.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new HomeworkService();
        const list = await service.listHomework(tenantId);
        return createSuccessResponse(list);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.homework.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new HomeworkService();
        const homework = await service.createHomework(body, tenantId, user.uid);
        return createApiResponse(201, homework, "Homework posted successfully");
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.homework.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
          return createErrorResponse(400, "Homework ID is required");
        }
        const service = new HomeworkService();
        await service.deleteHomework(id, tenantId, user.uid);
        return createSuccessResponse(null, { message: "Homework deleted successfully" });
      })
    )
  )
);
