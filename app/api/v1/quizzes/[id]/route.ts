export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { QuizService } from "@/services/quiz.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.quizzes.view)(async (req: Request, { tenantId }: TenantContext) => {
        const id = new URL(req.url).pathname.split("/").pop() || "";
        const service = new QuizService();
        const quiz = await service.getQuizById(id, tenantId);
        if (!quiz) return createErrorResponse(404, "Quiz not found");
        return createSuccessResponse(quiz);
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.quizzes.create)(async (req: Request, { tenantId }: TenantContext) => {
        const id = new URL(req.url).pathname.split("/").pop() || "";
        const service = new QuizService();
        const quiz = await service.getQuizById(id, tenantId);
        if (!quiz) return createErrorResponse(404, "Quiz not found");
        await service.deleteQuiz(id, tenantId);
        return createSuccessResponse(null, { message: "Quiz deleted successfully" });
      })
    )
  )
);
