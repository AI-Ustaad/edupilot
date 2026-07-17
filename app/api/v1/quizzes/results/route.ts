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
        const { searchParams } = new URL(req.url);
        const quizId = searchParams.get("quizId");
        if (!quizId) return createErrorResponse(400, "quizId is required");
        const service = new QuizService();
        const submissions = await service.getSubmissions(quizId, tenantId);
        return createSuccessResponse(submissions);
      })
    )
  )
);
