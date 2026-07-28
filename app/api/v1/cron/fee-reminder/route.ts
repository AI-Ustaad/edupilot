export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { FeeReminderService } from "@/services/fee-reminder.service";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return createErrorResponse(401, "Unauthorized");
    }

    const service = new FeeReminderService();
    const result = await service.sendReminders();

    return createSuccessResponse(result);
  } catch (error: any) {
    return createErrorResponse(500, error.message || "Cron failed");
  }
}
