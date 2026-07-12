export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth/auth-server';
import { StudentRepository } from '@/repositories/student.repository';
import { StaffRepository } from '@/repositories/staff.repository';
import { FeesService } from '@/services/fees.service';
import { FeesRepository } from '@/repositories/fees.repository';
import { logger } from '@/lib/logger/logger';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user || user.role !== 'admin' || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;

    // Use repositories/services instead of direct Firestore for students and fees
    const [studentCount, staffCount, totalRevenue] = await Promise.all([
      new StudentRepository().count(tenantId),
      new StaffRepository().count(tenantId),
      new FeesService(new FeesRepository()).getTotalRevenue(tenantId),
    ]);

    const statsRef = adminDb.collection("tenants").doc(tenantId).collection("dashboard").doc("stats");
    await statsRef.set({
      students: studentCount,
      staff: staffCount,
      revenue: totalRevenue,
      lastRebuildAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Stats successfully rebuilt",
      data: { students: studentCount, staff: staffCount, revenue: totalRevenue }
    });

  } catch (error) {
    logger.error('Rebuild stats error:', { metadata: { error } });
    return NextResponse.json({ error: 'Failed to rebuild stats' }, { status: 500 });
  }
}
