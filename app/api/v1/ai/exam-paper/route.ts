export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { ExamService } from "@/services/ai/exam.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import type { TenantContext } from "@/types/api";

const examService = new ExamService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.exams.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        // AI Quota & Burst Rate Limit Guard
        const quotaCheck = await enforceAiQuota(user, "exam-paper");
        if (!quotaCheck.allowed) {
          return createAiErrorResponse(quotaCheck);
        }

        const body = await req.json().catch(() => ({}));
        const { bookTitle, chapters, classGrade, subject, questionTypes, totalMarks } = body;
        if (!classGrade || !subject) {
          return createErrorResponse(400, "Missing required fields (classGrade, subject)");
        }

        const startTime = Date.now();
        try {
          const result = await examService.generateExam(
            {
              className: classGrade,
              subject,
              topic: chapters?.join(", ") || "General",
              difficulty: "medium",
            },
            tenantId,
            user.uid
          );

          await recordAiTelemetry({
            tenantId,
            userId: user.uid,
            featureKey: "exam-paper",
            latencyMs: Date.now() - startTime,
            success: true,
          });

          return createSuccessResponse(result);
        } catch (err: any) {
          await recordAiTelemetry({
            tenantId,
            userId: user.uid,
            featureKey: "exam-paper",
            latencyMs: Date.now() - startTime,
            success: false,
            error: err.message,
          });

          return createErrorResponse(500, "Exam paper generator is temporarily unavailable.");
        }
      })
    )
  )
);
