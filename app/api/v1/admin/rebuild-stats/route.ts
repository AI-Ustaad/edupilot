export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth/auth-server';
import { logger } from '@/lib/logger/logger';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user || user.role !== 'admin' || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;

    const studentsSnap = await adminDb.collection('students').where('tenantId', '==', tenantId).get();
    const studentCount = studentsSnap.size;

    const staffSnap = await adminDb.collection('staff').where('tenantId', '==', tenantId).get();
    const staffCount = staffSnap.size;

    const feesSnap = await adminDb.collection('fees').where('tenantId', '==', tenantId).get();
    let totalRevenue = 0;
    feesSnap.forEach(doc => {
      totalRevenue += Number(doc.data().amountPaid || 0);
    });

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
