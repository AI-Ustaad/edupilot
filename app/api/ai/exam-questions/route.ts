import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { aiRateLimit } from "@/lib/ratelimit";
import { ExamService } from "@/services/ai/exam.service";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withRateLimit(aiRateLimit)(
      withTenant(async (req: Request, { tenantId }: TenantContext) => {
        const { className, subject, topic, difficulty } = await req.json();
        if (!className || !subject || !topic || !difficulty) {
          return createApiResponse(400, null, "Missing required fields");
        }

        const service = new ExamService();
        const exam = await service.generateExam({ className, subject, topic, difficulty });
        return createApiResponse(200, exam);
      })
    )
  )
);
