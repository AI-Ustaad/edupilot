import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin, adminDb, dbTimestamp } from '@/lib/firebase-admin';
import { getTenantIdFromRequest } from '@/lib/tenant-utils';

// Ensure admin is initialized (though adminDb already does it)
initAdmin();

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const classGrade = searchParams.get('classGrade');
    const section = searchParams.get('section');

    let query = adminDb.collection('attendance').where('tenantId', '==', tenantId);
    if (date) query = query.where('date', '==', date);
    if (classGrade) query = query.where('classGrade', '==', classGrade);
    if (section) query = query.where('section', '==', section);

    const snapshot = await query.get();
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(records);
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser(); // You need to import getSessionUser if not already
    if (!user?.uid) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const records = await req.json(); // Expecting an array of attendance records
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'Invalid payload, expected array of records' }, { status: 400 });
    }

    const batch = adminDb.batch();
    for (const record of records) {
      const { studentId, studentName, rollNumber, classGrade, section, date, status } = record;
      if (!studentId || !date || !status) {
        return NextResponse.json({ error: 'Missing required fields in one or more records' }, { status: 400 });
      }

      const docId = `${studentId}_${date}`;
      const docRef = adminDb.collection('attendance').doc(docId);
      batch.set(docRef, {
        studentId,
        studentName: studentName || '',
        rollNumber: rollNumber || '',
        classGrade: classGrade || '',
        section: section || '',
        date,
        status,
        tenantId,
        createdBy: user.uid,
        createdAt: dbTimestamp,  // ← Correct: dbTimestamp is already FieldValue.serverTimestamp()
        updatedAt: dbTimestamp,
      }, { merge: true });
    }
    await batch.commit();

    return NextResponse.json({ success: true, message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
