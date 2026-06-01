// app/api/jobs/attendance-report/route.ts
import { NextResponse } from 'next/server';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRepository } from '@/repositories/attendance.repository';
import { sendEmail } from '@/lib/email';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const tenantsSnap = await adminDb.collection('tenants').get();
    const tenants = tenantsSnap.docs.map(doc => doc.id);

    for (const tenantId of tenants) {
      const attendanceService = new AttendanceService(new AttendanceRepository());
      // پچھلے مہینے کی حاضری کی رپورٹ تیار کریں
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7); // YYYY-MM

      // آپ اپنی مرضی کے مطابق رپورٹ ڈیٹا نکال سکتے ہیں
      const records = await attendanceService.listAttendance(tenantId, {
        // date filters if needed
      });

      // مثال کے طور پر، انتظامیہ کو ای میل کریں
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@school.com';
      await sendEmail({
        to: adminEmail,
        subject: `Monthly Attendance Report - ${lastMonthStr}`,
        html: `<p>Attendance report for ${lastMonthStr} has been generated.</p>`
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Attendance report job failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
