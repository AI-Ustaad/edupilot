export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { TimetableService } from "@/services/ai/timetable.service";
import { StaffRepository } from "@/repositories/staff.repository";
import { canonicalizeSubject } from "@/lib/utils/formatClassLabel";
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

      // N23: ground teacher assignment in the live staff roster. Staff records
      // carry the subjects each teacher is rostered for (StaffDocument.subjects),
      // so the generator can match teachers to subjects instead of assigning
      // one teacher to everything. Roster load must never fail generation.
      let teacherSubjects: Record<string, string[]> = {};
      let rosterNamesWithSubjects: string[] = [];
      let rosterNames: string[] = [];
      try {
        const staff = await new StaffRepository().findAll(tenantId);
        for (const member of staff || []) {
          const name = String((member as any).fullName || "").trim();
          if (!name) continue;
          rosterNames.push(name);
          const subs = (((member as any).subjects || []) as string[])
            .map((s) => canonicalizeSubject(s))
            .filter(Boolean);
          if (subs.length > 0) {
            rosterNamesWithSubjects.push(name);
            teacherSubjects[name] = Array.from(new Set(subs));
          }
        }
      } catch {
        teacherSubjects = {};
        rosterNamesWithSubjects = [];
        rosterNames = [];
      }

      // N23: when the caller provides no teachers, use rostered staff instead
      // of fabricated placeholder names ("Sir Ahmed", "Ms. Fatima" are not on
      // the roster). The old default survives only if the roster is empty.
      const rawTeachers =
        body.teachers ||
        (rosterNamesWithSubjects.length > 0
          ? rosterNamesWithSubjects
          : rosterNames.length > 0
            ? rosterNames
            : ["Sir Ahmed", "Ms. Fatima", "Ghzandar Ali"]);
      const teachers = Array.isArray(rawTeachers) ? rawTeachers : String(rawTeachers).split(",").map((t: string) => t.trim());
      const rawDays = body.days || body.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const days = Array.isArray(rawDays) ? rawDays : [rawDays];
      const periods = Number(body.periods || body.periodsPerDay || 8);

      const normalizedPayload = {
        classes,
        subjects,
        teachers,
        teacherSubjects,
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
