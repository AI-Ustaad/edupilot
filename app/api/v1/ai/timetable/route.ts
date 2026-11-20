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
      const rawClasses = body.classes || (body.classGrade ? [body.classGrade] : ["Class 10"]);
      const classes = Array.isArray(rawClasses) ? rawClasses : [rawClasses];
      const rawSubjects = (body.subjects && body.subjects.length > 0) ? body.subjects : ["Mathematics", "English", "General Science", "Urdu", "Islamiat"];
      const subjects = Array.isArray(rawSubjects) ? rawSubjects : [rawSubjects];
      const rawTeachers = body.teachers || ["Sir Ahmed", "Ms. Fatima", "ghzandar Ali"];
      const teachers = Array.isArray(rawTeachers) ? rawTeachers : String(rawTeachers).split(",").map((t: string) => t.trim());
      const rawDays = body.days || body.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const days = Array.isArray(rawDays) ? rawDays : [rawDays];
      const periods = Number(body.periods || body.periodsPerDay || 8);

      const normalizedPayload = {
        classes,
        subjects,
        teachers,
        days,
        periods,
      };

      const startTime = Date.now();
      try {
        const result = await timetableService.generateTimetable(normalizedPayload, tenantId, user.uid);

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "timetable",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse(result);
      } catch (err: any) {
        const fallback = timetableService.generateDeterministicFallbackSchedule(normalizedPayload);
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "timetable",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse(fallback);
      }
    })
  )
);
