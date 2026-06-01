// app/api/jobs/fee-reminder/route.ts
import { NextResponse } from 'next/server';
import { FeesService } from '@/services/fees.service';
import { FeesRepository } from '@/repositories/fees.repository';
import { sendEmail } from '@/lib/email';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const tenantsSnap = await adminDb.collection('tenants').get();
    const tenants = tenantsSnap.docs.map(doc => doc.id);
    let totalProcessed = 0;

    for (const tenantId of tenants) {
      const feesService = new FeesService(new FeesRepository());
      const allFees = await feesService.listFees(tenantId);
      
      const overdue = allFees.data.filter((fee: any) => {
        const dueDate = new Date(fee.dueDate);
        return dueDate < new Date() && fee.status === 'pending';
      });

      for (const fee of overdue) {
        // فی الحال طالب علم کے نام سے ای میل نکالنے کی بجائے لاگ کریں، یا اپنے موجودہ فیلڈ کے مطابق بدلیں
        const email = (fee as any).email || (fee as any).parentEmail;
        if (email) {
          await sendEmail(
            email,
            `Fee Reminder: ${fee.feeMonth}`,
            `<p>Dear Parent,<br/>This is a reminder that the fee of Rs. ${fee.amountPaid} for ${fee.feeMonth} is pending.<br/>Please make the payment at your earliest convenience.</p>`
          );
          totalProcessed++;
        }
      }
    }

    return NextResponse.json({ success: true, processed: totalProcessed });
  } catch (error: any) {
    console.error('Fee reminder job failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
