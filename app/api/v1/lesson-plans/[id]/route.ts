export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { LessonPlanService } from "@/services/lesson-plan.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.lessonPlans.view)(async (req: Request, context: any) => {
        const tenantId = context?.tenantId;
        const id = context?.params?.id || getIdFromUrl(req);
        const service = new LessonPlanService();
        const plan = await service.getLessonPlanById(id, tenantId);
        if (!plan) return createErrorResponse(404, "Lesson plan not found");
        return createSuccessResponse(plan);
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission([PERMISSIONS.lessonPlans.create, PERMISSIONS.lessonPlans.delete, "lessonPlans" as any])(
        async (req: Request, context: any) => {
          const tenantId = context?.tenantId;
          const user = context?.user;
          const id = context?.params?.id || getIdFromUrl(req);
          if (!id) return createErrorResponse(400, "Lesson Plan ID is required");

          const service = new LessonPlanService();
          await service.deleteLessonPlan(id, tenantId, user?.uid || "admin");
          return createSuccessResponse(null, { message: "Lesson plan deleted successfully" });
        }
      )
    )
  )
);
