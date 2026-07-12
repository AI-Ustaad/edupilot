export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { TimetableService } from "@/services/ai/timetable.service";
import type { TenantContext } from "@/types/api";

const timetableService = new TimetableService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const body = await req.json();
      if (!body.classes || !body.subjects || !body.teachers) {
        return createErrorResponse(400, "Missing required fields (classes, subjects, teachers)");
      }

      const result = await timetableService.generateTimetable(body, tenantId, user.uid);
      return createSuccessResponse(result);
    })
  )
);
