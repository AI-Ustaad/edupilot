export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { ExamService } from "@/services/ai/exam.service";
import type { TenantContext } from "@/types/api";

const examService = new ExamService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, _context: TenantContext) => {
      const body = await req.json();
      if (!body.className || !body.subject || !body.topic) {
        return createErrorResponse(400, "Missing required fields (className, subject, topic)");
      }

      const result = await examService.generateExam(body);
      return createSuccessResponse(result);
    })
  )
);
