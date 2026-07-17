export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { LessonPlanService } from "@/services/lesson-plan.service";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.lessonPlans.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new LessonPlanService();
        const page = Number(new URL(req.url).searchParams.get("page") || 1);
        const limit = Number(new URL(req.url).searchParams.get("limit") || 50);
        const result = await service.listLessonPlans(tenantId, page, limit);
        return createSuccessResponse(result, { message: "Lesson plans fetched successfully" });
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.lessonPlans.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const service = new LessonPlanService();
        const body = await req.json();
        const plan = await service.createLessonPlan(body, tenantId, user.uid);
        return createApiResponse(201, plan, "Lesson plan created");
      })
    )
  )
);
