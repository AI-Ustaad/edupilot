export const dynamic = 'force-dynamic';
import { FeeReminderService } from '@/services/fee-reminder.service';
import { logger } from '@/lib/logger/logger';
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export async function GET(req: Request) {
  // Security – verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return createErrorResponse(401, "Unauthorized");
  }

  try {
    const result = await new FeeReminderService().sendReminders();
    return createSuccessResponse(result);
  } catch (error: any) {
    logger.error('Fee reminder job failed:', { metadata: { error } });
    return createErrorResponse(500, error.message);
  }
}
