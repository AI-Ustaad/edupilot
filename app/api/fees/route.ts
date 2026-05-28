import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';
import { getTenantIdFromRequest } from '@/lib/tenant-utils';

initAdmin();
const db = getFirestore();

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    let query = db.collection('fees').where('tenantId', '==', tenantId);
    if (studentId) query = query.where('studentId', '==', studentId);

    const snapshot = await query.get();
    const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(fees);
  } catch (error) {
    console.error('Fees GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, studentName, rollNumber, classGrade, feeMonth, amountPaid, paymentMethod, remarks } = body;

    if (!studentId || !amountPaid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newFee = {
      studentId,
      studentName: studentName || '',
      rollNumber: rollNumber || '',
      classGrade: classGrade || '',
      feeMonth: feeMonth || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      amountPaid: Number(amountPaid),
      paymentMethod: paymentMethod || 'Cash',
      remarks: remarks || '',
      tenantId,
      timestamp: new Date().toISOString(),
      createdAt: new Date()
    };

    const docRef = await db.collection('fees').add(newFee);
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Fees POST error:', error);
    return NextResponse.json({ error: 'Failed to save fee' }, { status: 500 });
  }
}
