export const dynamic = 'force-dynamic';
import { FeesRepository } from '@/repositories/fees.repository';
import { TenantRepository } from '@/repositories/tenant.repository';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger/logger';
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export async function GET(req: Request) {
  // Security – verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return createErrorResponse(401, "Unauthorized");
  }

  try {
    const feesRepo = new FeesRepository();
    const tenantRepo = new TenantRepository();
    const today = new Date().toISOString().slice(0, 10);
    const tenants = await tenantRepo.listAll();
    let totalProcessed = 0;

    for (const tenant of tenants) {
      const tenantId = tenant.id!;
      const overdueFees = await feesRepo.findWithFilters(tenantId, { paid: false, dueBefore: today });

      for (const fee of overdueFees) {
        const feeData = fee as any;
        if (feeData.email) {
          await sendEmail(
            feeData.email,
            `Fee Reminder: ${feeData.feeMonth}`,
            `<p>Dear Parent,<br/>This is a reminder that the fee of Rs. ${feeData.amountPaid} for ${feeData.feeMonth} is pending.<br/>Please make the payment at your earliest convenience.</p>`
          );
          totalProcessed++;
        }
      }
    }

    return createSuccessResponse({ processed: totalProcessed });
  } catch (error: any) {
    logger.error('Fee reminder job failed:', { metadata: { error } });
    return createErrorResponse(500, error.message);
  }
}
