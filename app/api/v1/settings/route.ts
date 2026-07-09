export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth/auth-server';
import { logger } from '@/lib/logger/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = await adminDb.collection('tenants').doc(user.tenantId).collection('settings').doc('config').get();

    if (!doc.exists) {
      return NextResponse.json({ success: true, data: { classes: [], subjects: [] } });
    }

    return NextResponse.json({ success: true, data: doc.data() });
  } catch (error) {
    logger.error('Settings GET error:', { metadata: { error } });
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { classes, subjects } = body;

    await adminDb.collection('tenants').doc(user.tenantId).collection('settings').doc('config').set({
      classes: classes || [],
      subjects: subjects || [],
      updatedAt: new Date().toISOString()
    }, { merge: true });

    if (classes && Array.isArray(classes)) {
      const sectionsRef = adminDb.collection('sections');
      
      const oldSections = await sectionsRef.where('tenantId', '==', user.tenantId).get();
      const batch = adminDb.batch();
      
      oldSections.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      classes.forEach((cls: any) => {
        if (cls.name && cls.sections && Array.isArray(cls.sections)) {
          cls.sections.forEach((secName: string) => {
            const docRef = sectionsRef.doc();
            batch.set(docRef, {
              tenantId: user.tenantId,
              classGrade: cls.name,
              sectionName: secName,
              incharge: '',
              createdAt: new Date().toISOString()
            });
          });
        }
      });

      await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Settings PUT error:', { metadata: { error } });
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
