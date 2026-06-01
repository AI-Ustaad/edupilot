import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';
import { getTenantIdFromRequest } from '@/lib/tenant-utils';
import { z } from 'zod';

initAdmin();
const db = getFirestore();

const settingsSchema = z.object({
  classes: z.array(z.string()),
  sections: z.array(z.object({
    classGrade: z.string(),
    sectionName: z.string(),
    incharge: z.string().optional()
  })),
  subjects: z.array(z.string()),
  periods: z.array(z.object({
    name: z.string(),
    startTime: z.string(),
    endTime: z.string()
  }))
});

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settingsDoc = await db.collection('tenants').doc(tenantId).collection('settings').doc('config').get();
    if (!settingsDoc.exists) {
      return NextResponse.json({ classes: [], sections: [], subjects: [], periods: [] });
    }
    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = settingsSchema.parse(body);

    await db.collection('tenants').doc(tenantId).collection('settings').doc('config').set(validated, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
