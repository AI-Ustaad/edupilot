export const dynamic = 'force-dynamic';
// app/api/v1/homework/route.ts
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { HomeworkService } from "@/services/homework.service";
import { HomeworkRepository } from "@/repositories/homework.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const service = new HomeworkService(new HomeworkRepository());
      const list = await service.listHomework(tenantId);
      return createApiResponse(200, list);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new HomeworkService(new HomeworkRepository());
        const homework = await service.createHomework(body, tenantId, user.uid);
        return createApiResponse(201, homework, "Homework posted successfully");
      })
    )
  )
);
