export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { LessonPlanService } from "@/services/lesson-plan.service";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";

const lessonPlanService = new LessonPlanService();

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.lessonPlans.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const plans = await lessonPlanService.listLessonPlans(tenantId);
      return createSuccessResponse(plans, { message: "Lesson plans fetched successfully" });
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.lessonPlans.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const body = await req.json();
      const plan = await lessonPlanService.createLessonPlan(body, tenantId, context.user.uid);
      return createApiResponse(201, plan, "Lesson plan created");
    }
  )
);
