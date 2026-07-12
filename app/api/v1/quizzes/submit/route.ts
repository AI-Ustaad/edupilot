export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { QuizService } from "@/services/quiz.service";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.quizzes.view)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        if (!body.quizId || !body.studentId || !body.answers) {
          return createErrorResponse(400, "Missing required fields: quizId, studentId, answers");
        }
        const service = new QuizService();
        const result = await service.submitQuiz(body, tenantId, user.uid);
        return createApiResponse(201, result, "Quiz submitted successfully");
      })
    )
  )
);
