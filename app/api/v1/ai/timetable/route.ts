export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { aiRateLimit } from "@/lib/ratelimit";
import { TimetableService } from "@/services/ai/timetable.service";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withRateLimit(aiRateLimit)(
      withTenant(async (req: Request, { tenantId }: TenantContext) => {
        const { classes, days, periods, subjects, teachers } = await req.json();
        if (!classes || !days || !periods || !subjects || !teachers) {
          return createApiResponse(400, null, "Missing required fields");
        }

        const service = new TimetableService();
        const timetable = await service.generateTimetable({
          classes,
          days,
          periods,
          subjects,
          teachers,
        });
        return createApiResponse(200, timetable);
      })
    )
  )
);
