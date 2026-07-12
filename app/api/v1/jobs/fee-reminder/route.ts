export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { FeesRepository } from '@/repositories/fees.repository';
import { sendEmail } from '@/lib/email';
import { adminDb } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger/logger';

export async function GET(req: Request) {
  // Security – verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feesRepo = new FeesRepository();
    const today = new Date().toISOString().slice(0, 10);
    const tenantsSnap = await adminDb.collection('tenants').get();
    let totalProcessed = 0;

    for (const tenantDoc of tenantsSnap.docs) {
      const tenantId = tenantDoc.id;
      // Use repository filter instead of fetching all fees + in-memory filter
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

    return NextResponse.json({ success: true, processed: totalProcessed });
  } catch (error: any) {
    logger.error('Fee reminder job failed:', { metadata: { error } });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
