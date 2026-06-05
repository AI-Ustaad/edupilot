export const dynamic = 'force-dynamic';
// app/api/admin/rebuild-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth/auth-server';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    
    // سیکیورٹی: یہ کمانڈ صرف ایڈمن چلا سکتا ہے
    if (!user || user.role !== 'admin' || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;

    // 1. اصل Students کی گنتی کریں (Real Database Scan)
    const studentsSnap = await adminDb.collection('students').where('tenantId', '==', tenantId).get();
    const studentCount = studentsSnap.size;

    // 2. اصل Staff کی گنتی کریں
    const staffSnap = await adminDb.collection('staff').where('tenantId', '==', tenantId).get();
    const staffCount = staffSnap.size;

    // 3. اصل Revenue کی گنتی کریں (مستقبل میں اس کی الگ Ledger API بنے گی)
    const feesSnap = await adminDb.collection('fees').where('tenantId', '==', tenantId).get();
    let totalRevenue = 0;
    feesSnap.forEach(doc => {
      totalRevenue += Number(doc.data().amountPaid || 0);
    });

    // 4. ڈیش بورڈ کی Stats فائل کو اوور رائٹ (Overwrite) کر دیں
    const statsRef = adminDb.collection("tenants").doc(tenantId).collection("dashboard").doc("stats");
    await statsRef.set({
      students: studentCount,
      staff: staffCount,
      revenue: totalRevenue,
      lastRebuildAt: new Date().toISOString(), // ٹریکنگ کے لیے کہ آخری بار ری بلڈ کب ہوا تھا
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Stats successfully rebuilt",
      data: { students: studentCount, staff: staffCount, revenue: totalRevenue }
    });

  } catch (error) {
    console.error("Rebuild stats error:", error);
    return NextResponse.json({ error: 'Failed to rebuild stats' }, { status: 500 });
  }
}
