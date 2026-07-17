export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRepository } from '@/repositories/attendance.repository';
import { sendEmail } from '@/lib/email';
import { adminDb } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger/logger';

const CRON_SECRET = process.env.CRON_SECRET || 'internal-cron-secret';

export async function GET(req: Request) {
  // Validate cron secret
  const authHeader = req.headers.get('authorization') || '';
  const url = new URL(req.url);
  const querySecret = url.searchParams.get('secret');
  const providedSecret = authHeader.replace('Bearer ', '') || querySecret;

  if (providedSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tenantsSnap = await adminDb.collection('tenants').get();
    const tenants = tenantsSnap.docs.map(doc => doc.id);

    for (const tenantId of tenants) {
      const attendanceService = new AttendanceService(new AttendanceRepository());
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);

      const records = await attendanceService.listAttendance(tenantId);

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@school.com';
      await sendEmail(
        adminEmail,
        `Monthly Attendance Report - ${lastMonthStr}`,
        `<p>Attendance report for ${lastMonthStr} has been generated. Total records: ${records.length}</p>`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Attendance report job failed:', { metadata: { error } });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
