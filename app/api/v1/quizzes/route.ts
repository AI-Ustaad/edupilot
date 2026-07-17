export const dynamic = 'force-dynamic';
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { QuizService } from "@/services/quiz.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.quizzes.view)(async (_req: Request, { tenantId }: TenantContext) => {
        const service = new QuizService();
        const quizzes = await service.listQuizzes(tenantId);
        return createSuccessResponse(quizzes);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.quizzes.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const service = new QuizService();
        const quiz = await service.createQuiz(body, tenantId, user.uid);
        return createApiResponse(201, quiz, "Quiz created successfully");
      })
    )
  )
);
