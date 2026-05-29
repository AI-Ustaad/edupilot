import { NextRequest, NextResponse } from 'next/server';
import { adminDb, dbTimestamp } from '@/lib/firebase-admin';
import { getTenantIdFromRequest } from '@/lib/tenant-utils';
import { getSessionUser } from '@/lib/auth/auth-server';

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb.collection('staff').where('tenantId', '==', tenantId).get();
    const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Staff GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await req.json();
    const { personal, professional, education, financial, allowances, deductions, netPayDetails, loginDetails } = body;

    if (!personal?.fullName || !professional?.personnelNo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newStaff = {
      personal,
      professional,
      education: education || [],
      financial: financial || {},
      allowances: allowances || [],
      deductions: deductions || [],
      netPayDetails: netPayDetails || {},
      loginDetails,
      tenantId,
      createdBy: user.uid,
      createdAt: dbTimestamp,
      updatedAt: dbTimestamp,
    };

    const docRef = await adminDb.collection('staff').add(newStaff);
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Staff POST error:', error);
    return NextResponse.json({ error: 'Failed to save staff' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getSessionUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing staff ID' }, { status: 400 });

    const body = await req.json();
    const docRef = adminDb.collection('staff').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await docRef.update({ ...body, updatedAt: dbTimestamp, updatedBy: user.uid });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff PUT error:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing staff ID' }, { status: 400 });

    const docRef = adminDb.collection('staff').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
