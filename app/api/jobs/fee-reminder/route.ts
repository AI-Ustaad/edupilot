// app/api/jobs/fee-reminder/route.ts
import { NextResponse } from 'next/server';
import { FeesService } from '@/services/fees.service';
import { FeesRepository } from '@/repositories/fees.repository';
import { sendEmail } from '@/lib/email';               // آپ کی موجودہ ای میل یوٹیلیٹی
import { adminDb } from '@/lib/firebase-admin';         // صرف ٹیننٹس کی فہرست کے لیے

export async function GET(req: Request) {
  // Vercel Cron Jobs صرف GET سپورٹ کرتا ہے، اس لیے GET استعمال کریں
  try {
    // تمام ٹیننٹس کی فہرست حاصل کریں (یا مخصوص ٹیننٹ)
    const tenantsSnap = await adminDb.collection('tenants').get();
    const tenants = tenantsSnap.docs.map(doc => doc.id);
    const processed = 0;

    for (const tenantId of tenants) {
      const feesService = new FeesService(new FeesRepository());
      const allFees = await feesService.listFees(tenantId);
      
      // ان فیسوں کو فلٹر کریں جو مقررہ تاریخ سے پہلے کی ہیں اور حالت pending ہے
      const overdue = allFees.data.filter((fee: any) => {
        const dueDate = new Date(fee.dueDate);
        return dueDate < new Date() && fee.status === 'pending';
      });

      for (const fee of overdue) {
        // والدین / طالب علم کو ای میل بھیجیں
        const email = fee.studentEmail || fee.email; // آپ کے ڈیٹا ماڈل کے مطابق
        if (email) {
          await sendEmail({
            to: email,
            subject: `Fee Reminder: ${fee.feeMonth}`,
            html: `<p>Dear Parent,<br/>This is a reminder that the fee of Rs. ${fee.amountPaid} for ${fee.feeMonth} is pending.<br/>Please make the payment at your earliest convenience.</p>`
          });
        }
      }
      processed += overdue.length;
    }

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    console.error('Fee reminder job failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
