export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { TimetableService } from "@/services/ai/timetable.service";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import type { TenantContext } from "@/types/api";

const timetableService = new TimetableService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      // AI Quota & Burst Rate Limit Guard
      const quotaCheck = await enforceAiQuota(user, "timetable");
      if (!quotaCheck.allowed) {
        return createAiErrorResponse(quotaCheck);
      }

      const body = await req.json().catch(() => ({}));
      if (!body.classes || !body.subjects || !body.teachers) {
        return createErrorResponse(400, "Missing required fields (classes, subjects, teachers)");
      }

      const startTime = Date.now();
      try {
        const result = await timetableService.generateTimetable(body, tenantId, user.uid);

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "timetable",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse(result);
      } catch (err: any) {
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "timetable",
          latencyMs: Date.now() - startTime,
          success: false,
          error: err.message,
        });

        return createErrorResponse(500, "Timetable AI generator is temporarily unavailable.");
      }
    })
  )
);
