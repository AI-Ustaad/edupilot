export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { ExamService } from "@/services/ai/exam.service";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import type { TenantContext } from "@/types/api";

const examService = new ExamService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      // AI Quota & Burst Rate Limit Guard
      const quotaCheck = await enforceAiQuota(user, "exam-questions");
      if (!quotaCheck.allowed) {
        return createAiErrorResponse(quotaCheck);
      }

      const body = await req.json().catch(() => ({}));
      if (!body.className || !body.subject || !body.topic) {
        return createErrorResponse(400, "Missing required fields (className, subject, topic)");
      }

      const startTime = Date.now();
      try {
        const result = await examService.generateExam(body, tenantId, user.uid);

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "exam-questions",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse(result);
      } catch (err: any) {
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "exam-questions",
          latencyMs: Date.now() - startTime,
          success: false,
          error: err.message,
        });

        return createErrorResponse(500, "Exam questions generator is temporarily unavailable.");
      }
    })
  )
);
