export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { aiRateLimit } from "@/lib/ratelimit";
import { ReportService } from "@/services/ai/report.service";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withRateLimit(aiRateLimit)(
      withTenant(async (req: Request, { tenantId }: TenantContext) => {
        const { studentName, grade, subject, marks, attendance } = await req.json();
        if (!studentName || !grade || !subject || marks == null || attendance == null) {
          return createApiResponse(400, null, "Missing required fields");
        }

        const service = new ReportService();
        const comment = await service.generateComment({
          studentName,
          grade,
          subject,
          marks,
          attendance,
        });
        return createApiResponse(200, { comment });
      })
    )
  )
);
